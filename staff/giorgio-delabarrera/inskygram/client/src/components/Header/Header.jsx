import React, { Component } from 'react'
import { withRouter } from 'react-router-dom'
import './Header.sass'
import Autosuggest from 'react-autosuggest';
import logic from '../../logic'

// TODO: define env variables
const DEFAULT_AVATAR = 'https://goo.gl/F65XTo'

function getSuggestionValue(suggestion) {
  return suggestion.username;
}

function renderSuggestion(suggestion) {
  const user = suggestion
  return (
    <div className="Header-suggestion">
      <div className="Header-suggestionImageWrapper">
        <img
          src={user.imageUrl ? user.imageUrl : DEFAULT_AVATAR}
          alt={user.username}
          className="Header-suggestionImage"
        />
      </div>
      <div className="Header-suggestionUser">
        <div className="Header-suggestionUsername">{user.username}</div>
        {user.name && <div className="Header-suggestionName">{user.name}</div>}
      </div>
    </div>
  );
}

class Header extends Component {
  state = {
    query: '',
    results: []
  }

  handleHomeClick = event => {
    event.preventDefault()
    this.props.onHomeClick()
  }

  handleExploreClick = event => {
    event.preventDefault()
    this.props.onExploreClick()
  }

  handleProfileClick = event => {
    event.preventDefault()
    this.props.onProfileClick()
  }

  handleNewPostClick = event => {
    event.preventDefault()
    this.props.onNewPostClick()
  }

  onQueryChange = (event, { newValue }) => {
    this.setState({
      query: newValue
    });
  };

  onSuggestionsFetchRequested = ({ value }) => {
    logic.search(value)
      .then(results => this.setState({ results }))
  };

  onSuggestionsClearRequested = () => this.setState({ query: '', results: [] })

  onSuggestionSelected = (event, { suggestion }) => {
    const user = suggestion
    this.props.history.push(`/${user.username}`)
  };

  render() {
    const { query, results } = this.state;

    const inputProps = {
      placeholder: "Search",
      value: query,
      onChange: this.onQueryChange
    };

    return (
      <header className="Header">
        <div className="Header-logoWrapper">
          <a href="#/" className="Header-logoLink" onClick={this.handleHomeClick}>
            <span className="Header-iconLogo"></span>
            <span className="Header-logo"></span>
          </a>
        </div>
        <div className="Header-searchWrapper">
          {/* <input className="Header-search" type="text" placeholder="Search" /> */}
          <Autosuggest
            suggestions={results}
            onSuggestionsFetchRequested={this.onSuggestionsFetchRequested}
            onSuggestionsClearRequested={this.onSuggestionsClearRequested}
            onSuggestionSelected={this.onSuggestionSelected}
            getSuggestionValue={getSuggestionValue}
            renderSuggestion={renderSuggestion}
            inputProps={inputProps}
          />
        </div>
        <div className="Header-nav">
          <a className="Header-navLink" href="#/" onClick={this.handleNewPostClick}>
            <i className="Header-navIcon far fa-plus-square"></i>
          </a>
          <a className="Header-navLink" href="#/" onClick={this.handleExploreClick}>
            <i className="Header-navIcon far fa-compass"></i>
          </a>
          <a className="Header-navLink" href="#/" onClick={this.handleProfileClick}>
            <i className="Header-navIcon far fa-user"></i>
          </a>
        </div>
      </header>
    )
  }
}

// Header.defaultProps = {
//   visibleSearch: true
// };

export default withRouter(Header)