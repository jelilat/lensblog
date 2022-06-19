
import { GET_PROFILES, GET_DEFAULT_PROFILE } from './Queries/Profile'
import AppContext from './Utils/Appcontext'
import { useAccount } from 'wagmi'
import { useQuery } from '@apollo/client'

function SiteLayout() {
    const { data: account } = useAccount()

    const { data } = useQuery(GET_DEFAULT_PROFILE, {
        variables: { request: { ethereumAddress: account?.address}},
        onCompleted(data){
            console.log(data?.defaultProfile)
        }
      })
    
      const injectedGlobalContext = {
        data
       }

    return (
        <AppContext.Provider value={data?.defaultProfile}>
            <div>
                {/* Hello @{data?.defaultProfile?.handle} */}
            </div>
        </AppContext.Provider>
    )
}

export default SiteLayout