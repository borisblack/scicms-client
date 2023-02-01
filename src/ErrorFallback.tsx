import {FallbackProps} from 'react-error-boundary'
import styled from 'styled-components'
import {useTranslation} from 'react-i18next'

const Container = styled.div`  
    height: 100vh;
    color: #ffffff;
    background-color: #143765;
    padding: 10% 20%;
`
const Hr = styled.hr `
    border: none;
    height: 2px;
    color: #255887;
    background-color: #255887;
`
const Smile = styled.p`
    color: #255887;
    font-size: 3em;
    font-weight: bold;
`
const Title = styled.p`
    font-size: 1.875em;
`
const Desc = styled.p`
    color: #255887;
    font-weight: bold;
`
const Small = styled.div`
    font-size: .875em;
`
const Label = styled.p`
    color: #b8babc;
    font-size: .75em;
    margin: 16px 0;
`

export default function ErrorFallback({error}: FallbackProps) {
    const {t} = useTranslation()

    return (
        <Container>
            <Smile>:(</Smile>
            <Title>{t('Oops! An error has occurred')}</Title>
            <Hr/>
            <Desc>{t('Client application error')}</Desc>
            <Small>
                <p>{t('Try to do the following')}:</p>
                <ul>
                    <li>{t('restart the program')};</li>
                    <li>{t('check network connection')};</li>
                    <li>{t('contact administrator')}.</li>
                </ul>
            </Small>
            <Label>{error.message}</Label>
            <Hr/>
        </Container>
    )
}
