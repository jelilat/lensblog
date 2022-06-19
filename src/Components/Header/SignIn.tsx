import React, { FC, useState } from 'react';
import { AUTHENTICATION } from '../Mutations/Authenticate';
import { GET_CHALLENGE } from '../Queries/Authenticate';
import { useMutation, useQuery, useLazyQuery } from '@apollo/client';
import { useAccount, useSignMessage } from 'wagmi';
import Cookies, { CookieAttributes } from 'js-cookie';
import { Modal } from '../UI/Modal';
import Connect from './Connect';
import logo from '../../lensblog.png';

export default function SignIn() {
    const { data: account } = useAccount();
    const [connectModal, setConnectModal] = useState(false);
    const COOKIE_CONFIG: CookieAttributes = {
        sameSite: 'None',
        secure: true,
        expires: 360
      }
    const accessToken = Cookies.get('accessToken')
    const [getChallenge, ] = useLazyQuery(GET_CHALLENGE, {
       variables: { request: {
           address: account?.address,
       }},
       fetchPolicy:'no-cache',
       onCompleted(data){
              console.log(data);    
       }
    })

   const [authenticate] = useMutation(AUTHENTICATION, {
        // fetchPolicy:'no-cache',
        onCompleted(data){
                console.log(data);    
          }
   })
   
//    const profiles = useQuery(GET_PROFILES, {
//        variables: { ownedBy: account?.address},
//        skip: !default_profile,

//    })

   const { signMessageAsync, isLoading: signLoading } = useSignMessage()

   const logout = () => {
         Cookies.remove('accessToken')
         Cookies.remove('refreshToken')
   }
    
    return (
        <>
            <nav className="flex items-center justify-between flex-wrap bg-black-500 p-3 border-2 border-b-black-500">
                <div className="flex items-center flex-shrink-0 text-black mr-6">
                    <img src={logo} className="max-h-10" />
                    <span className="font-semibold text-xl tracking-tight">Lensblog</span>
                </div>
                <div className="block lg:hidden">
                    <button className="flex items-center px-3 py-2 border rounded text-black-200 border-black-400 hover:text-black hover:border-black">
                    <svg className="fill-current h-3 w-3" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><title>Menu</title><path d="M0 3h20v2H0V3zm0 6h20v2H0V9zm0 6h20v2H0v-2z"/></svg>
                    </button>
                </div>
                <div className="w-full block flex-grow lg:flex lg:w-auto">
                    <div className="text-sm lg:flex-grow">
                    <a href="/" className="block mt-4 lg:inline-block lg:mt-0 text-black hover:text-black mr-4">
                        <button>Home</button>
                    </a>
                    <a href="create" className="block mt-4 lg:inline-block lg:mt-0 text-black-200 hover:text-black mr-4">
                        <button>Create</button>
                    </a>
                    </div>
                    <div>
                    {!account &&
                <button className="text-white inline-flex items-center justify-center px-3 py-1 border border-transparent text-base font-medium rounded-md text-white bg-black hover:bg-black"
                    onClick={() => {
                    setConnectModal(true)
                }}>Connect wallet
                    <Modal
                    title="Connect Wallet"
                    show={connectModal}
                    onClose={() => {
                        setConnectModal(false)
                    }}
                >
                    <Connect />
                </Modal>
                </button>}
                {!accessToken ?
                    <button 
                        className="text-white inline-flex items-center justify-center px-3 py-1 border border-transparent text-base font-medium rounded-md text-white bg-black hover:bg-black"
                        onClick={() => {
                        getChallenge()
                          .then(({data}) => {
                            signMessageAsync({message: data?.challenge?.text})  
                              .then(async (signature) => {
                                  await authenticate({
                                      variables: {
                                          request: {
                                              address: account?.address, signature
                                          }
                                      }
                                  })
                                  .then((res) => {
                                    Cookies.set(
                                        'accessToken',
                                        res.data.authenticate.accessToken,
                                        COOKIE_CONFIG
                                      )
                                      Cookies.set(
                                        'refreshToken',
                                        res.data.authenticate.refreshToken,
                                        COOKIE_CONFIG
                                      )
                                  })
                              })
                          })
                        }}>
                        Login with Lens
                    </button>
                    : <button 
                        className="text-white inline-flex items-center justify-center px-3 py-1 border border-transparent text-base font-medium rounded-md text-white bg-black hover:bg-black"
                        onClick={() => {
                            logout()
                        }}>
                            Logout
                      </button>
                    } 
                    </div>
                </div>
            </nav>  
        </>
    )
}