import { Component } from 'react';
import { epics, reducers } from './flux';

class Workflow extends Component {

    // Custom name for container
    static displayName = 'Workflow';

    // Custom properties for borderline model
    static modelName = 'workflow';
    static modelEpics = epics;
    static modelReducers = reducers;

    render() {
        return null;
    }
}

export default Workflow;
