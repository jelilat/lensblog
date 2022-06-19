import { useState } from 'react';
import { GET_PUBLICATION } from '../Queries/Publications'
import { useQuery } from '@apollo/client'
import Header from '../Header/Header'

const Post = () => {
    const publicationId = window.location.href.split('/').filter(element => element !== '').pop()
    const [publication, setPublication] = useState<string>('')
    
    useQuery(GET_PUBLICATION, {
        variables: { request: {
            publicationId: publicationId
        }},
        onCompleted(data){
            setPublication(data?.publication?.metadata?.content)
        }
    })
    return (
        <>
            <Header />
            <div className="m-10"
                dangerouslySetInnerHTML={{ __html: publication }} />
        </>
    )
}

export default Post;