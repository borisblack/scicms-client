import {gql, useMutation} from '@apollo/client'

const MUTATION = gql`
  mutation ($file: Upload!) {
    upload(file: $file) {
      id
      filename
      description
      fileSize
      mimetype
      checksum
      createdAt
    }
  }
`

export function UploadFile() {
    const [mutate] = useMutation(MUTATION);

    function onChange(event: any) {
        if (event.target.validity.valid)
            mutate({ variables: { file: event.target.files[0] } })
    }

    return <input type="file" required onChange={onChange} />
}
