import { useState, useContext } from 'react'
import { useAccount, useNetwork, useSignMessage, useSignTypedData, chain } from 'wagmi'
import { useMutation, useQuery } from '@apollo/client'
import toast from 'react-hot-toast'
import { CREATE_POST_TYPED_DATA } from '../Mutations/Publication'
import { GET_DEFAULT_PROFILE } from '../Queries/Profile'
import { BROADCAST_MUTATION } from '../Mutations/Broadcast'
import { uploadToIPFS, uploadImageToIPFS } from '../../lib/uploadToIPFS'
import { v4 as uuidv4 } from 'uuid'
import { utils } from 'ethers'
import { useContractWrite } from 'wagmi'
import omit from '../../lib/omit';
import AppContext from '../Utils/Appcontext'
import Cookies from 'js-cookie'
import { CreatePostBroadcastItemResult } from '../../generated/types'
import { LensHubProxy } from '../../abis/LensHubProxy'
import { EditorState, convertToRaw, ContentState } from 'draft-js';
import 'draft-js/dist/Draft.css';
import { Editor } from "react-draft-wysiwyg";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import draftToHtml from "draftjs-to-html";
import Header from "../Header/Header"

const Create = () => {
  const [files, setFiles] = useState<string[]>([]);
  const [defaultProfile, setDefaultProfile] = useState<string>();
  const [editorState, setEditorState] = useState(
    () => EditorState.createEmpty(),
  );
    const { data: account } = useAccount();
    const { activeChain } = useNetwork()
    const [post, setPost] = useState('')
    const [isUploading, setIsUploading] = useState(false)
    // const { defaultProfile } = useContext(AppContext)
    const {
        data,
        isLoading: writeLoading,
        write
      } = useContractWrite(
        {
          addressOrName: '0x60Ae865ee4C725cd04353b5AAb364553f56ceF82',
          contractInterface: LensHubProxy
        },
        'postWithSig',
        {
          onError(error: any) {
            toast.error(error?.data?.message ?? error?.message)
          }
        }
      )

      const [broadcast, { data: broadcastData, loading: broadcastLoading }] =
      useMutation(BROADCAST_MUTATION, {
        onError(error) {
        //   if (error.message === ERRORS.notMined) {
        //     toast.error(error.message)
        //   }
          console.log('Relay Error', '#ef4444', error.message)
        }
      })
    const { isLoading: signLoading, signTypedDataAsync } = useSignTypedData({
        onError(error) {
          toast.error(error?.message)
        }
      })

    useQuery(GET_DEFAULT_PROFILE, {
      variables: { request: {
        ethereumAddress: account?.address
      }},
      onCompleted(data){
        // console.log(data)
        setDefaultProfile(data?.defaultProfile?.id)
      }
    })

    const [createPostTypedData, {loading: typedDataLoading}] = useMutation(
        CREATE_POST_TYPED_DATA, {
            onCompleted({
                createPostTypedData
            }: {
                createPostTypedData: CreatePostBroadcastItemResult
              }) {
                console.log('Mutation', '#4ade80', 'Generated createPostTypedData')
                // console.log(createPostTypedData)
                const { id, typedData } = createPostTypedData
                const {
                    profileId,
                    contentURI,
                    collectModule,
                    collectModuleInitData,
                    referenceModule,
                    referenceModuleInitData
                } = typedData?.value

                signTypedDataAsync({
                    domain: omit(typedData?.domain, '__typename'),
                    types: omit(typedData?.types, '__typename'),
                    value: omit(typedData?.value, '__typename')
                  }).then((signature) => {
                    const { v, r, s } = utils.splitSignature(signature)
                    const sig = { v, r, s, deadline: typedData.value.deadline }
                    const inputStruct = {
                      profileId,
                      contentURI,
                      collectModule,
                      collectModuleInitData,
                      referenceModule,
                      referenceModuleInitData,
                      sig
                    }

                    broadcast({ variables: { request: { id, signature } } }).then(
                        ({ data, errors }) => {
                          if (errors || data?.broadcast?.reason === 'NOT_ALLOWED') {
                            write({ args: inputStruct })
                          }
                        }
                      )
                })
            }
        }
    )

    const createBlogPost = async () => {
        if (!account?.address) {
            console.log("Connect wallet")
        } else if (activeChain?.id !== chain.polygonMumbai.id) {
            console.log("Connect to Mumbai Testnet")
        } else {
          // console.log(post)
          setIsUploading(true)
            console.log("Uploading")
            const { path } = await uploadToIPFS({
                version: '1.0.0',
                metadata_id: uuidv4(),
                description: post,
                content: post,
                external_url: null,
                image: null,
                imageMimeType: null,
                name: `Post by @${defaultProfile}`,
                mainContentFocus: files[0],
                attributes: [
                    {
                        traitType: 'string',
                        key: 'type',
                        value: 'post'
                    }
                ],
                media: null,
                createdOn: new Date(),
                appId: 'Lensblog'
            })
            setIsUploading(false)
            console.log("Posting")
            createPostTypedData({
                variables: {
                    request: {
                        profileId: defaultProfile,
                        contentURI: `https://ipfs.infura.io/ipfs/${path}`,
                        collectModule: {
                            freeCollectModule: {
                              followerOnly: false
                            }
                          },
                          referenceModule: {
                            followerOnlyReferenceModule: false
                          }
                    }
                }
            })
        }
    }

    const uploadImageCallBack = async (file: any) => {
        console.log("Uploading image")
        const { path } = await uploadImageToIPFS(file)
        setFiles([...files, path])
        const imageURL = `https://ipfs.infura.io/ipfs/${path}`
        return new Promise (
            (resolve, reject) => {
              resolve({
                data: {
                  link: imageURL
                }
              })
            }
        )
      }

    return (
        <>
            <Header />
        <div>
          <h1 className="text-2xl font-bold text-left ml-10 my-5">Create Blog Post</h1>
        </div>
        {(Cookies.get('accessToken') && Cookies.get('refreshToken')) ?
        <div>
          <div className="mx-10 my-5 p-3 border-2 border-black rounded-lg h-96 min-h-full">
          <Editor 
           editorStyle={{
             "height": "19rem",
            }}
            editorState={editorState} 
            onEditorStateChange={(e) => {
              setEditorState(e)
              setPost(draftToHtml(convertToRaw(editorState.getCurrentContent())))
            }}
            placeholder="Tell a story..."
            // ref="editor"
            spellCheck={true} 
            toolbar={{
              options: ['inline', 'list', 'textAlign', 'link', 'emoji', 'image', 'remove', 'history'],
              link:{
                defaultTargetOption: '_blank',
              },
              image: {
                urlEnabled: true,
                uploadEnabled: true,
                uploadCallback: uploadImageCallBack,
                alignmentEnabled: true,
                inputAccept: 'image/gif,image/jpeg,image/jpg,image/png,image/svg',
              }
            }}
            />
        </div>
        <div>
          <button className="mx-10 inline-flex items-center justify-center px-3 py-1 border border-transparent text-base font-medium rounded-md text-white bg-black hover:bg-black"
            onClick={()=> {
                createBlogPost()
            }}>
                Post
            </button>
        </div>
        </div>
        : <div>
          {account?.address ?
          <div className="mx-10 ">Login with Lens to create a blog post</div>
          : <div className="mx-10">Connect your wallet to create a blog post</div>}
        </div>
        }
        </>
    )
}

export default Create