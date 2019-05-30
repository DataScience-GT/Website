import React from 'react'; 
import { Button, Form, Table, Container} from "react-bootstrap";

/**
 * Super Action class. This provides every component 
 * with a user object inside, so we don't have to continuously re-query 
 * firestore. 
 */
export class DashboardAction extends React.Component {
    constructor(props) {
        super(props)
        this.userPromise = (this.props.firebase.user.get_user(props.authUser.uid));
    }
    render() {
        return;
    }
}

/**
 * Action to create a group. This internally uses the 
 * [[../Firebase/groups]] API to create a group. Upon creation of a group, 
 * two things happen: 
 * 1. The group is added to the `/usergroups/` collection as a document. The 
 * group document looks like: 
 * ```json 
 * { 
 *  "name": "group_name", 
 *  "members": [], 
 *  "join_requests": []
 * }
 * ``` 
 * `members` is really a firebase collection. Each document in the members 
 * collection is an empty document with the same UID as the user. 
 * the `join_requests` collection appears when there are join requests. 
 */
export class CreateGroupAction extends DashboardAction {
    constructor(props) {
        super(props); 
        this.state = {
            name: "" 
        }; 
        this.handleInputChange = this.handleInputChange.bind(this); 
        this.handleSubmit = this.handleSubmit.bind(this); 
    }

    handleInputChange(event) {
        this.setState({name: event.target.value}); 
    }

    /**
     * A simple wrapper that interally just calls create_group with the name. 
     * @param event The triggering JS event 
     */
    handleSubmit(event) {
        event.preventDefault(); 
        const name = this.state.name; 
        this.props.firebase.group.create_group(name); 
    }
    render() {
        return (
            <Form onSubmit={this.handleSubmit}>
                <Form.Group>
                    <Form.Label>New Group Name</Form.Label>
                    <Form.Control onChange={this.handleInputChange} name="name"></Form.Control>
                </Form.Group>
                <Button variant="primary" type="submit">Create</Button>
            </Form>
        )
    }
}

/**
 * Similar to above, but performs a recursive delete on a group. 
 * Again, internally just calls delete_group. 
 */
export class DeleteGroupAction extends DashboardAction {
    constructor(props) {
        super(props); 
        this.state = {
            name: ""
        }
        this.handleInputChange = this.handleInputChange.bind(this); 
        this.handleSubmit = this.handleSubmit.bind(this); 
        this.setup_groups_available();
    }
    async setup_groups_available() {
        const availale_groups = await this.props.firebase.group.get_groups();
        this.groups_available = availale_groups.map(group => 
            <li>{group}</li>
        )

    }
    handleInputChange(event){
        this.setState({name: event.target.value}); 
    }

    handleSubmit(event) {
        event.preventDefault(); 
        const name = this.state.name; 
        this.props.firebase.group.delete_group(name); 
    }

    render() {
        return (
            <Form onSubmit={this.handleSubmit}>
                <p>Available Groups: </p>
                <ul>{this.groups_available}</ul>
                <Form.Group>
                    <Form.Label>Delete Group Name</Form.Label>
                    <Form.Control onChange={this.handleInputChange} name="name"></Form.Control>
                </Form.Group>
                <Button variant="primary" type="submit">Delete</Button>
            </Form>
        )
    }
}

/**
 * Similar to the other two; provides a UI wrapper for the 
 * `user.requestJoinGroup` function call. Note that this one is in the `user` 
 * api instead of the `group` api. 
 */
export class CreateJoinRequestAction extends DashboardAction {
    constructor(props) {
        super(props) 
        this.state = {
            available_groups: [], 
            name: "", 
            reason: "", 
        }

        this.handleInputChange = this.handleInputChange.bind(this); 
        this.handleSubmit = this.handleSubmit.bind(this); 
    }

    componentDidMount() {
        this.props.firebase.group.get_groups().then(groups => {
            this.setState({"available_groups": groups})
        })
    }
    handleInputChange(event) {
        let target = event.target; 
        this.setState({[target.name]: target.value})
    }

    handleSubmit(event) {
        event.preventDefault(); 
        this.props.firebase.user.requestJoinGroup(this.state.name, this.state.reason); 
    }
    render() {
        return (
            <Form onSubmit={this.handleSubmit}>
                <Form.Group> 
                    <Form.Control as="select" onChange={this.handleInputChange} name="name"> 
                        <option>None Selected</option>
                        {this.state.available_groups.map(group => <option key={group} value={group}>{group}</option>)}
                    </Form.Control>
                </Form.Group>
                <Form.Group>
                    <Form.Label>Reason</Form.Label>
                    <Form.Control name="reason" as="textarea" rows='3' onChange={this.handleInputChange}></Form.Control>
                </Form.Group>
                <Button variant="primary" type="submit">Create Request</Button>
            </Form>
        )
    }
}

/**
 * Allows a member of a group to approve or deny the addition of another member. 
 * Internally wraps up `user.respondToJoinRequest` and `group.getPendingRequests` 
 * into one UI element. 
 */
export class TakeRequestAction extends DashboardAction {
    constructor(props) {
        super(props) 
        this.state = {
            "available_groups": [],
            "selected": "", 
            "requests": []
        }; 
        this.reqs = [] 
        this.handleInputChange = this.handleInputChange.bind(this); 
        this.handleSubmit = this.handleSubmit.bind(this); 
        this.handleClick = this.handleClick.bind(this); 

       
    }

    componentDidMount() {
         /**
         * This should be changed so that it only shows the users' groups. 
         * Should be a simple fix from `this.props.firebase.group.get_groups()` 
         * to `this.user.groups` (which is an array). This would also 
         * drastically make the render better as there's one less database 
         * query to be taken. I would change it now but I'm tired and too 
         * lazy to test. See issue #78
         */
        this.props.firebase.group.get_groups().then(groups => {
            this.setState({"available_groups": groups}); 
        })
    }
    handleInputChange(event) {
        let target = event.target; 
        this.setState({
            "selected": target.value
        }, this.handleUpdateRequests); 
    }

    handleUpdateRequests(force) {
        this.props.firebase.group.getPendingRequests(this.state.selected).then(req => {
            if (!force) {
                this.setState({"requests": req.docs.map(doc => doc.data())}); 
            } else {
                this.state.requests = req.docs.map(doc => doc.data()); 
                this.forceUpdate(); 
            }
        })
    }

    handleSubmit(event) {
        event.preventDefault(); 
    }
    
    handleClick(event) {
        this.props.firebase.user.respondToJoinRequest(this.state.selected, event.target.value, 
            event.target.name === "approve" ? 1 : 0); 
        this.handleUpdateRequests(true); 
    }

    render() {
        return (
            <Container> 
                <Form onSubmit={this.handleSubmit}>
                    <Form.Group>
                        <Form.Label>Select Group for Requests</Form.Label>
                        <Form.Control onChange={this.handleInputChange} as="select" name="selected_option">
                            <option> None selected </option> 
                            {this.state.available_groups.map(group => <option key={group} value={group}>{group}</option>)}
                        </Form.Control>
                    </Form.Group>
                </Form>
                <Table> 
                    <tbody>

                    {this.state.requests.map(req => 
                        <tr key={req.user}>
                            <td>{req.first_name}</td>
                            <td>{req.last_name}</td>
                            <td>{req.reason}</td>
                            <td>
                                <Button variant="primary" name="approve" value={req.user} onClick={this.handleClick}>Approve</Button>
                                <Button variant="danger" name="deny" value={req.user} onClick={this.handleClick}>Deny</Button>
                            </td>
                        </tr>
                     )}
                    </tbody>
                </Table>
            </Container> 
        )
    }
}

/**
 * Allows a finance user to confirm whether or not a payment has been made. 
 * Essentially a UI wrapper for `user.verifyUserPayment`. 
 */
export class VerifyPendingUserAction extends DashboardAction {
    constructor(props) {
        super(props); 
        this.state = {
            "pending_users": []
        }; 
        this.handleStatusChange = this.handleStatusChange.bind(this); 
    }
    componentDidMount() {
        // get pending users 
        this.update_pending_users_state(); 
    }
 
    async update_pending_users_state() {
        // fetch pending users 
        let ret = await this.props.firebase.user.getPendingUsers(); 
        if (ret) {
            this.update_users(ret); 
        }
    }

    update_users(snapshot) {
        this.setState({"pending_users": snapshot})
    
    }
    
    handleStatusChange(event) {
        let target = event.target; 
        this.props.firebase.user.verifyUserPayment(target.value, target.name, target.is_cash); 
        this.update_pending_users_state(); 
    }
    render_verification_stub(req) {
        if (req.verification_uri === "") {
            return "Deferred"
        }
        else if (req.verification_uri.split(",")[0] === "cash") {
            return req.verification_uri
        } else {
            return <img alt={req.verification_uri} src={req.verification_uri}></img>
        }
    }
    render() { return (
        <Container> 
            <Table> 
                <tbody>

                {this.state.pending_users.map(req => 
                    <tr key={req.uid}>
                        <td>{req.first_name}</td>
                        <td>{req.last_name}</td>
                        <td>{this.render_verification_stub(req)}</td>
                        <td>
                            <Button variant="danger" name="0" value={req.uid} is_cash={(req.verification_uri.split(",")[0] === "cash").toString()} onClick={this.handleStatusChange}>Suspend</Button>
                            <Button variant="primary" name="1" value={req.uid} is_cash={(req.verification_uri.split(",")[0] === "cash").toString()} onClick={this.handleStatusChange}>Paid Semester</Button>
                            <Button variant="primary" name="2" value={req.uid} is_cash={(req.verification_uri.split(",")[0] === "cash").toString()} onClick={this.handleStatusChange}>Paid Year</Button>
                        </td>
                    </tr>
                    )}
                </tbody>
            </Table>

        </Container>
    )
    }
}