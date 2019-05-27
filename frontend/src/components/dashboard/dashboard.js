import React from 'react'; 
import { withFirebase } from '../Firebase'; 
import {Container} from "react-bootstrap"; 
import * as ROUTES from "../../constants/routes"; 
import {withRouter} from "react-router-dom"
import {compose} from "recompose"; 
import {AuthUserContext} from "../Session"; 
import {CreateGroupAction, DeleteGroupAction, CreateJoinRequestAction, TakeRequestAction, VerifyPendingUserAction} from "./actions"; 

/**
 * TODO: Build some dashboard here. 
 */

class Dashboard extends React.Component {
    constructor(props) {
        super(props); 
        this.authUser = props.authUser; 
    }

    render() {
        return (
            <Container> 
                <CreateGroupAction firebase={this.props.firebase} authUser={this.authUser}/> 
                <br/>
                <DeleteGroupAction firebase={this.props.firebase} authUser={this.authUser}/>
                <br/>
                <CreateJoinRequestAction firebase={this.props.firebase} authUser={this.authUser}/>
                <TakeRequestAction firebase={this.props.firebase} authUser={this.authUser}/>
                <VerifyPendingUserAction firebase={this.props.firebase} authUser={this.authUser}></VerifyPendingUserAction>
            </Container>
        )
    }
}

const DashboardWithFirebase = compose(withRouter, withFirebase) (Dashboard); 

export default class DashboardPage extends React.Component{
    render() {
        return (
            <div className="dashboard">
                <Container> 
                    <AuthUserContext.Consumer>
                        {authUser => authUser? <DashboardWithFirebase authUser={authUser} />: "Loading..."}
                    </AuthUserContext.Consumer> 
                </Container>
            </div>
        )
    }
}
