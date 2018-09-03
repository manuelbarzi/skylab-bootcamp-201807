import React, {Component} from 'react'
import {Container, Row, Col, Alert} from 'reactstrap';
import {Button, Modal, ModalHeader, ModalBody, ModalFooter} from 'reactstrap';
import OpenGames from "./OpenGames"
import ChessboardGroup from "./ChessboardGroup"
import PropTypes from 'prop-types'


class Games extends Component {

  static propTypes = {
    onGameMove: PropTypes.func,
    currentGames: PropTypes.array,
    nickname: PropTypes.string,
    onRespondToGameRequest: PropTypes.func,
    onAcknowledgeGameOver:PropTypes.func,

  }

  state = {
    currentGameID: sessionStorage.getItem('currentGameID') || '',
    error: '',
    inviter: '',
    invitedGameID: '',
    modal: false,
  }

  onError = error => {
    this.setState({error})
  }

  clearError = () => {
    this.setState({error: ''})
  }

  onRespondToGameRequest = (destination, gameID, answer) => {
    const {props: {onRespondToGameRequest}} = this
    this.clearError()
    this.setState({modal: false, inviter: '', invitedGameID: ''})
    onRespondToGameRequest(destination, gameID, answer)
  }

  onGameMove = (move, gameID, opponent) => {
    const {props: {onGameMove, nickname, currentGames}, state: {currentGameID}} = this
    this.clearError()
    if (gameID === currentGameID) {
      const game = currentGames.find(game => game.id === gameID)
      if (game) {
        if (game.toPlay === nickname) {
          onGameMove(move, gameID, opponent)
        } else {
          this.onError("It's not your turn")
        }
      }
    }
  }

  onOpenGamesUserClick = (game) => {
    this.clearError()
    if (game.state === "invited") {
      this.setState({modal: true, inviter: game.opponent, invitedGameID: game.id})
    } else {
      sessionStorage.setItem('currentGameID', game.id)
      this.setState({currentGameID: game.id})
    }
  }

  render() {
    let {props: {currentGames, nickname,onAcknowledgeGameOver}, state: {error, currentGameID, inviter, invitedGameID}, onGameMove} = this

    return  <div className="mainContainer games__container">

    <Container className="games__mainChessContainer">

          <Row className="games__mainChessRow">
            <Col xs="12" md="3">
              {currentGames.length && <OpenGames onUserClick={this.onOpenGamesUserClick}
                                                 games={currentGames.filter(game => game.state !== 'terminated')}
                                                 nickname={nickname}
                                                 currentGameViewed={currentGames.find(game => game.id === currentGameID)}/>

              }
            </Col>
            <Col xs="12" md="9">
              {currentGames.length && <ChessboardGroup onGameMove={onGameMove}
                                                       onError={this.onError}
                                                       currentGame={currentGames.find(game => game.id === currentGameID)}
                                                       onAcknowledgeGameOver={onAcknowledgeGameOver}
                                                       nickname={nickname}/>}
            </Col>

          </Row> <Row>
          <Col xs="0" md="4">

          </Col>
          <Col xs="12" md="4">
            {error && <Alert color="warning"> {error}</Alert>}
          </Col>
        </Row>
        </Container>
        <Modal isOpen={this.state.modal} toggle={this.toggle} className={this.props.className}>
          <ModalHeader toggle={this.toggle}>Invitation</ModalHeader>
          <ModalBody>
            {inviter} has invited you to a game.
          </ModalBody>
          <ModalFooter>
            <Button color="primary"
                    onClick={() => this.onRespondToGameRequest(inviter, invitedGameID, true)}>Accept</Button>
            <Button color="secondary"
                    onClick={() => this.onRespondToGameRequest(inviter, invitedGameID, false)}> Reject </Button>
          </ModalFooter>
        </Modal>

      </div>


  }

}

export default Games