import {gql, useMutation} from '@apollo/client'
import React, {useState} from 'react'

const MUTATION = gql`
      mutation upload($file: Upload!) {
        upload(file: $file)
      }
    `

export function MultipartScriptUpload() {
    const [
        uploadScriptMultipartMutation,
        {
            loading: mutationLoading,
            error: mutationError,
            data: mutationData,
        },
    ] = useMutation(MUTATION)

    const [scriptMultipartInput, setScriptMultipartInput] = useState<any>()

    const onSubmitScriptMultipart = () => {
        const fileInput = scriptMultipartInput.files[0];
        uploadScriptMultipartMutation({
            variables: { file: fileInput }
        })
    }

    return (
        <div>
            <h3> Upload script using multipart HTTP POST</h3>
            <form
                onSubmit={e => {
                    e.preventDefault();
                    onSubmitScriptMultipart();
                }}>
                <label>
                    <input
                        type="file"
                        ref={ref => {
                            setScriptMultipartInput(ref!)
                        }}
                    />
                </label>
                <br />
                <br />
                <button type="submit">Submit</button>
            </form>
        </div>
    )
}