import React, { Component } from 'react'
import axios from 'axios'
import { Route, Link } from 'react-router-dom'
import LoginForm from './components/LoginForm/LoginForm'
import SignupForm from './components/SignupForm/SignupForm'
import Header from './components/Header/Header'
import Home from './pages/Home'
import './App.css'
import Patient from './pages/Patient'
import { Nav, Navbar, NavItem } from "react-bootstrap"

const DisplayLinks = props => {
	if (props.loggedIn) {
		return (
			<Navbar collapseOnSelect className="navbar navbar-default navbar-fixed-top">
					   <Navbar.Header>
					    <Navbar.Brand>
					      <a href="">RxMinder</a>
					    </Navbar.Brand>
					      <Navbar.Toggle />
					    </Navbar.Header>
					    <Navbar.Collapse>
					      <Nav pullRight>
					        <NavItem className="nav-item" eventKey={1}><Link to="/">
					          <span className="glyphicon glyphicon-home"><a className="nav-item">  Home</a></span></Link>
					         </NavItem>

					        <NavItem className="nav-item" eventKey={2}><Link to="#" onClick={props._logout}>
					          <span className="glyphicon glyphicon-share-alt"><a className="nav-item">  Logout</a></span>
					         </Link>
					         </NavItem>


					         <NavItem className="nav-item" eventKey={3}><Link to="/patient">
					          <span className="glyphicon glyphicon-user"><a className="nav-item">  Patient-Profile</a></span></Link>
					         </NavItem> 
					      </Nav>
					    </Navbar.Collapse>
					</Navbar>
		)
	} else {
        return (
          <Navbar collapseOnSelect className="navbar navbar-default navbar-fixed-top">
					   <Navbar.Header>
					    <Navbar.Brand>
					      <a href="">RxMinder</a>
					    </Navbar.Brand>
					      <Navbar.Toggle />
					    </Navbar.Header>
					    <Navbar.Collapse>
					      <Nav pullRight className="navBtns">
					        <NavItem eventKey={1}><Link to="/">
					          <span className="glyphicon glyphicon-home"><a className="nav-item">  Home</a></span></Link>
					         </NavItem>
					        <NavItem eventKey={2}><Link to="/login">
					          <span className="glyphicon glyphicon-log-in"><a className="nav-item">  Login</a></span></Link>
					         </NavItem>
					         <NavItem eventKey={3}><Link to="/signup">
					          <span className="glyphicon glyphicon-user"><a className="nav-item">  Signup</a></span></Link>
					         </NavItem> 
					      </Nav>
					    </Navbar.Collapse>
					</Navbar>
        )
    }
}

class App extends Component {
	constructor() {
		super()
		this.state = {
			loggedIn: false,
			user: null,
			patient: null	
		}
		this._logout = this._logout.bind(this)
		this._login = this._login.bind(this)
	}
	componentDidMount() {
		axios.get('/auth/user').then(response => {
			console.log(response.data)
			if (!!response.data.user) {
				console.log(`${response.data.user.email} is being logged in`);
				this.setState({
					loggedIn: true,
					user: response.data.user
				})
			} else {
				this.setState({
					loggedIn: false,
					user: null
				})
			}
		})
	}

	_logout(event) {
		event.preventDefault()
		console.log('logging out')
		axios.post('/auth/logout').then(response => {
			console.log(response.data)
			if (response.status === 200) {
				this.setState({
					loggedIn: false,
					user: null
				})
			}
		})
	}

	_login(email, password) {
		axios
			.post('/auth/login', {
				email,
				password
			})
			.then(response => {
				console.log(response)
				if (response.status === 200) {
					// update the state
					this.setState({
						loggedIn: true,
						user: response.data.user
					})
				}
			})
	}

	render() {
		return (
			<div className="App">
						{/* LINKS to our different 'pages' */}
						<DisplayLinks _logout={this._logout} loggedIn={this.state.loggedIn} />
						{/*  ROUTES */}
						{/* <Route exact path="/" component={Home} /> */}
						<Route exact path="/" render={() => <Home user={this.state.user} />} 
						/>
						<Route exact path="/patient" render={() => <Patient user={this.state.user} />} 
						/>
						<Route exact path="/login" render={() => <LoginForm _login={this._login} />}
						/>
						<Route exact path="/signup" component={SignupForm} />

			</div>
		)
	}
}

export default App
