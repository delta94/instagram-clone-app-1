import { types } from "./actions"
import { initState } from "./DataProvider"

export const reducer = (state, action) => {
    switch (action.type) {
        case types.ADD_TOKEN: {
            const auth = {...state.auth, token: action.payload}
            return {...state, auth, isAuthenticated: true}
        }
        case types.ADD_USER: {
            const auth = {...state.auth, user: action.payload}
            return {...state, auth}
        }
        case types.CLEAR_AUTH: {
            return {...state, auth: initState.auth}
        }
        default:
            throw new Error(`Unhandled action type: ${action.type}`)
    }
}