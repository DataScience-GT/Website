import React from 'react'; 
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';

/**
 * @author Vidhur Kumar
 */
export default class DashboardNavbar extends React.Component {

    render() {
        return (
            <div>
                <Navbar collapseOnSelect expand="lg" bg="primary" variant="dark">
                    <Navbar.Brand href="#home">Dashboard</Navbar.Brand>
                    <Navbar.Toggle aria-controls="responsive-navbar-nav" />
                    <Navbar.Collapse id="responsive-navbar-nav">
                        <Nav className="mr-auto">
                        <Nav.Link href="">Home</Nav.Link>
                        <Nav.Link href="/edit">Edit Profile</Nav.Link>
                        </Nav>
                        <Nav>
                        </Nav>
                    </Navbar.Collapse>
                </Navbar>
            </div>
        )
    }
}