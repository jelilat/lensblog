import { ApolloError } from '@apollo/client'
import { Profile } from '../../generated/types'
import { createContext, Dispatch } from 'react'

export interface ContextType {
//   selectedProfile: number
//   setSelectedProfile: Dispatch<number>
//   profiles: Profile[]
//   currentUser: Profile | undefined
//   currentUserLoading: boolean
//   currentUserError?: ApolloError
    defaultProfile: Profile | undefined
}

const AppContext = createContext<ContextType>({
//   selectedProfile: 0,
//   setSelectedProfile: () => {},
//   profiles: [],
//   currentUser: undefined,
//   currentUserLoading: false,
//   currentUserError: undefined
    defaultProfile: undefined
})

export default AppContext
