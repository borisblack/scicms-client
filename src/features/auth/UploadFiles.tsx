import {gql, useMutation} from "@apollo/client";

const MUTATION = gql`
  mutation ($files: [Upload!]!) {
    uploadMultiple(files: $files) {
      id
      filename
      description
      fileSize
      mimetype
      checksum
      createdAt
    }
  }
`;

export function UploadFiles() {
    const [mutate] = useMutation(MUTATION);

    function onChange(evt: any) {
        if (evt.target.validity.valid) mutate({ variables: { files: evt.target.files } })
    }

    return <input type="file" multiple required onChange={onChange} />;
}