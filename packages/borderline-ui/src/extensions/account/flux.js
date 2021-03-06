import { of, concat } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import NavigationButton from './containers/NavigationButton';
import View from './containers/View';

const types = {

    ACCOUNT_HYDRATE: 'ACCOUNT_HYDRATE'
};

export const actions = {

    dockToPager: () => ({
        type: '@@core/pager/PAGE_DOCK',
        path: 'account',
        icon: NavigationButton,
        view: View
    }),

    getCurrentUser: () => ({
        type: '@@core/session/SESSION_FETCH',
        replyTo: types.ACCOUNT_HYDRATE
    })
};

export const epics = {

    enclaveBoot:
        (action) => action.ofType('START')
            .pipe(mergeMap(() =>
                concat(
                    of(actions.dockToPager()),
                    of(actions.getCurrentUser())
                )))

};

const initial = {};

export const reducers = {

    accountReducer:
        (state = initial, action) => {

            switch (action.type) {
                case types.ACCOUNT_HYDRATE:
                    return hydrateAccount(state, action);
                case 'STOP':
                    return initial;
                default:
                    return state;
            }
        }
};

const hydrateAccount = (state, action) => {

    state.user = action.user;
    return state;
};

export default {
    actions,
    epics,
    reducers
};
