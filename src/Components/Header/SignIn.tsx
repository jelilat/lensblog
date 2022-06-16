import React, { FC, useState } from 'react';
import { AUTHENTICATION } from '../Mutations/Authenticate';
import { GET_CHALLENGE } from '../Queries/Authenticate';
import { useMutation, useQuery, useLazyQuery } from '@apollo/client';
import { useAccount, useSignMessage } from 'wagmi';
import { Modal } from '../UI/Modal';
import Connect from './Connect';

export default function SignIn() {
    const { data: account } = useAccount();
    const [connectModal, setConnectModal] = useState(false);

   const [getChallenge, { data, loading, error, fetchMore }] = useLazyQuery(GET_CHALLENGE, {
       variables: { request: {
           address: account?.address,
       }},
       fetchPolicy:'no-cache',
       onCompleted(data){
              console.log(data);    
       }
   })

   const [authenticate] = useMutation(AUTHENTICATION, {
        fetchPolicy:'no-cache',
        onCompleted(data){
                console.log(data);    
          }
   })

   const { signMessageAsync, isLoading: signLoading } = useSignMessage()
    
    return (
        <>
            {!account ?
                <button onClick={() => {
                    setConnectModal(true)
                }}>Sign in
                    <Modal
                    title="Connect Wallet"
                    show={connectModal}
                    onClose={() => {
                        setConnectModal(false)
                    }}
                >
                    <Connect />
                </Modal>
                </button>
                
                : <button>Sign out</button>}
                {account &&
                    <button onClick={() => {
                        getChallenge()
                          .then(({data}) => {
                            signMessageAsync({message: data?.challenge?.text})  
                              .then((signature) => {
                                  authenticate({
                                      variables: {
                                          request: {
                                              address: account?.address, signature
                                          }
                                      }
                                  })
                              })
                          })
                        }}>
                        Sign in with Lens
                    </button>} 
        </>
    )
}