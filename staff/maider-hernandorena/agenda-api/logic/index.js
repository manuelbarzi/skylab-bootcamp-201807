'use strict'

const validateEmail = require('../utils/validate-email')
const moment = require('moment')
const { Contact, Note, User } = require('../data/models')

const logic = {

    _validateStringField(name, value) {
        if (typeof value !== 'string' || !value.length) throw new LogicError(`invalid ${name}`)
    },

    _validateEmail(email) {
        if (!validateEmail(email)) throw new LogicError('invalid email')
    },

    _validateDateField(name, field) {
        if (!(field instanceof Date)) throw new LogicError(`invalid ${name}`)
    },

    register(email, password) {
        return Promise.resolve()
            .then(() => {
                this._validateStringField('email', email)
                this._validateEmail(email)
                this._validateStringField('password', password)

                return User.findOne({ email })
            })
            .then(user => {
                if (user) throw new LogicError(`user with ${email} email already exist`)

                return User.create({ email, password })
            })
            .then(() => true)
    },

    authenticate(email, password) {
        return Promise.resolve()
            .then(() => {
                this._validateStringField('email', email)
                this._validateEmail(email)
                this._validateStringField('password', password)

                return User.findOne({ email })
            })
            .then(user => {
                if (!user) throw new LogicError(`user with ${email} email does not exist`)
                if (user.password !== password) throw new LogicError(`wrong password`)

                return true
            })
    },

    updatePassword(email, password, newPassword) {
        return Promise.resolve()
            .then(() => {
                this._validateStringField('email', email)
                this._validateEmail(email)
                this._validateStringField('password', password)
                this._validateStringField('new password', newPassword)

                return User.findOne({ email })
            })
            .then(user => {
                if (!user) throw new LogicError(`user with ${email} email does not exist`)
                if (user.password !== password) throw new LogicError(`wrong password`)
                if (password === newPassword) throw new LogicError('new password must be different to old password')
                
                user.password = newPassword

                return user.save()
            })
            .then(() => true)
    },

    unregisterUser(email, password) {
        return Promise.resolve()
            .then(() => {
                this._validateStringField('email', email)
                this._validateEmail(email)
                this._validateStringField('password', password)

                return User.findOne({ email })
            })
            .then(user => {
                if (!user) throw new LogicError(`user with ${email} email does not exist`)
                if (user.password !== password) throw new LogicError(`wrong password`)

                return User.deleteOne({ _id: user._id })
            })
            .then(() => true)
    },

    addNote(email, date, text) {
        return Promise.resolve()
            .then(() => {
                this._validateStringField('email', email)
                this._validateEmail(email)
                this._validateDateField('date', date)
                this._validateStringField('text', text)

                return User.findOne({ email })
            })
            .then(user => {
                if (!user) throw new LogicError(`user with ${email} email does not exist`)

                const note = { date, text, user: user.id }

                return Note.create(note)
            })
            .then(() => true)
    },

    listNotes(email, date) {
        return Promise.resolve()
            .then(() => {
                this._validateEmail(email)

                return User.findOne({ email })
            })
            .then(user => {
                if (!user) throw new LogicError(`user with ${email} email does not exist`)

                const mDate = moment(date)

                const minDate = mDate.startOf('day').toDate()
                const maxDate = mDate.endOf('day').toDate()

                return Note.find({ user: user._id, date: { $gte: minDate, $lte: maxDate } }).lean()
            })
            .then(notes => notes || [] )
    },

    removeNote(email, noteId) {
        return Promise.resolve()
            .then(() => {
                this._validateEmail(email)

                return this._users.findOne({ email })
            })
            .then((user) => {
                if (!user) throw new LogicError(`user with ${email} email does not exist`)
            
                return this._notes.findOne({ _id: ObjectId(noteId) })
                    .then(note => {
                        if (!note) throw new LogicError(`note with id ${noteId} does not exist`)

                        if (note.user.toString() !== user._id.toString()) throw new LogicError('note does not belong to user')

                        return this._notes.deleteOne({ _id: ObjectId(noteId) })
                    })
            })
            .then(res => {
                if (res.result.nModified === 0) throw new LogicError('fail to remove note')

                return true
            })
    }

}

class LogicError extends Error {
    constructor(message) {
        super(message)
    }
}

module.exports = { logic, LogicError }