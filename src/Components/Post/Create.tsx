import { useState, useContext } from 'react'
import { useAccount, useNetwork, chain } from 'wagmi'
import { useMutation } from '@apollo/client'
import toast from 'react-hot-toast'
import { CREATE_POST_TYPED_DATA } from '../Mutations/Publication'
import { uploadToIPFS } from '../../lib/uploadToIPFS'
import { v4 as uuidv4 } from 'uuid'
import AppContext from '../Utils/Appcontext'

const Create = () => {
    const { data: account } = useAccount();
    const { activeChain } = useNetwork()
    const [post, setPost] = useState('')
    const [isUploading, setIsUploading] = useState(false)
    const { currentUser } = useContext(AppContext)
console.log(currentUser)
    const [createPostTypedData, {loading}] = useMutation(
        CREATE_POST_TYPED_DATA, {
            onCompleted({
                createPostTypedData
            }) {
                const { id, typedData } = createPostTypedData
                const {
                profileId,
                contentURI,
                collectModule,
                collectModuleInitData,
                referenceModule,
                referenceModuleInitData
                } = typedData?.value
            }
        }
    )

    const createBlogPost = async (name: string, description: string | null) => {
        if (!account?.address) {
            toast.error("Connect wallet")
        } else if (activeChain?.id !== chain.polygonMumbai.id) {
            toast.error("Connect to Mumbai Testnet")
        } else {
            setIsUploading(true)
            const { path } = await uploadToIPFS({
                version: '1.0.0',
                metadata_id: uuidv4(),
                description: post,
                content: post,
                external_url: null,
                image: null,
                imageMimeType: null,
                name: `Post by @${currentUser?.handle}`,
                attributes: [
                    {
                        traitType: 'string',
                        key: 'type',
                        value: 'post'
                    }
                ],
                media: null,
                appId: 'Lensblog'
            })
        }
    }

    return (
        <>
        <div>
            <textarea 
                onChange={(event) => {
                    setPost(event.target.value)
                }}
                value={post}
                placeholder="What's happening" 
            />

            <button>Create</button>
        </div>
        </>
    )
}

export default Create