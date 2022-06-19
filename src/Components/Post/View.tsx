import { useState } from 'react';
import { useQuery, useLazyQuery } from '@apollo/client';
import { EXPLORE_PUBLICATIONS } from '../Queries/Explore';
import { Post } from '../../generated/types'
import { TimeAgo } from '../../lib/dateConverter';

const View = () => {
    const [publications, setPublications] = useState<Post[]>([]);

    useQuery(EXPLORE_PUBLICATIONS, {
        variables: {
            request: {
                sortCriteria: "TOP_COMMENTED",
                publicationTypes: ["POST", "COMMENT", "MIRROR"],
                sources: ["Lensblog"],
                limit: 10
            }
        },
        fetchPolicy: 'no-cache',
        onCompleted(data){
            const publication = data?.explorePublications?.items;
            console.log(publication)
            publication.map(
                (publicationDetails: Post) => {
                    return (
                        setPublications((publications) => [...publications, publicationDetails])
                    )
                }
            )
        }
    })
    const timeConverter = (publication: Post) => {
        const epochtime = new Date(publication.createdAt).getTime()
        console.log(publication.createdAt, epochtime)
        const time = TimeAgo(epochtime)
        console.log(epochtime, time)
        return time
    }
    
    return(
        <>
            {
                publications?.map((publication, index) => {
                    return (
                        <div 
                            className="mx-10 my-5 p-3 border-2 rounded-lg bg-black-500 shadow-black max-h-46 overflow-clip" 
                            key={index}>
                            <p className="text-sm">author - @{publication.profile.handle}</p>
                            <p className="text-sm">Posted {timeConverter(publication)}</p><br />
                            <div dangerouslySetInnerHTML={{ __html: publication.metadata.content }}
                                className="text-ellipsis overflow-y-hidden" />
                        </div>

                    )
                })
            }
        </>
    )
}

export default View