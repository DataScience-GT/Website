import React from 'react';
import { shallow } from 'enzyme';
import { expect } from 'chai';
import Dashboard from '../../../Dashboard';
import UserWelcomeHeader from '../UserWelcomeHeader';
import DashboardHomePage from '../../../Common/Home Page/DashboardHomePage';

// TODO: Specify number of instances to be visible for the Dashboard Home Page.
describe('Test HomePage component with shallow rendering', () => {
    it('Crash free rendering', () => {
        const wrapper = shallow(<Dashboard />);
        // expect(wrapper.find(DashboardHomePage).dive().find(UserWelcomeHeader));
    });
});