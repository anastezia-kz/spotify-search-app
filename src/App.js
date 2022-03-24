import React from 'react'
import axios from 'axios'
import Button from 'react-bootstrap/Button'
import FormControl from 'react-bootstrap/FormControl'
import InputGroup from 'react-bootstrap/InputGroup'
import Form from 'react-bootstrap/Form'
import Card from 'react-bootstrap/Card'
import Spinner from 'react-bootstrap/Spinner'

import spotifyLogo from './assets/Spotify_Logo.png'

function App() {

  const {
    REACT_APP_CLIENT_ID,
    REACT_APP_AUTH_URL,
    REACT_APP_REDIRECT_URI,
    REACT_APP_RESPONSE_TYPE
  } = process.env

  const [token, setToken] = React.useState("")
  const [searchKey, setSearchKey] = React.useState("")
  const [artists, setArtists] = React.useState([])
  const [isLoading, setIsLoading] = React.useState(false)

  React.useEffect(() => {
      const hash = window.location.hash
      let token = window.localStorage.getItem("token")

      if (!token && hash) {
          token = hash.substring(1).split("&").find(elem => elem.startsWith("access_token")).split("=")[1]

          window.location.hash = ""
          window.localStorage.setItem("token", token)
      }

      setToken(token)

  }, [])

  const logout = () => {
      setToken("")
      window.localStorage.removeItem("token")
  }

  const searchArtists = async (e) => {
      e.preventDefault()
      setIsLoading(true)
      const {data} = await axios.get("https://api.spotify.com/v1/search", {
          headers: {
              Authorization: `Bearer ${token}`
          },
          params: {
              query: searchKey,
              type: "artist"
          }
      })

      //forced timeout to demonstrate Spinner, can be tested with preset "Fast 3G"
      setTimeout(() => {
        setArtists(data.artists.items)
        setIsLoading(false)
      },2000)
    }

  const renderArtists = () => {
      return artists.map(artist => (
          <Card key={artist.id}>
              {artist.images.length ? <img width={"100%"} src={artist.images[0].url} alt=""/> : <img src={spotifyLogo} alt=""/>}
              {artist.name}
          </Card>
      ))
  }

  return (
      <div className="m-5">
          <header className="App-header">
            <div className="d-flex justify-content-center align-items-center">
              <h1>Spotify Search</h1>
              <img width={"40px"} height={"40px"}  src={spotifyLogo} alt=""/>
            </div>
          </header>
          <div>
            {!token 
              ? <a className="btn btn-info" href={`${REACT_APP_AUTH_URL}?client_id=${REACT_APP_CLIENT_ID}&redirect_uri=${REACT_APP_REDIRECT_URI}&response_type=${REACT_APP_RESPONSE_TYPE}`}>
                  Login to Spotify
                </a>
                : <Button className="btn btn-success mb-3" onClick={logout}>Logout</Button>}

            {token 
              ? <Form onSubmit={searchArtists} className="mb-4">
                  <InputGroup >
                    <FormControl
                      placeholder="Start typing artist's name..."
                      aria-label="Start typing artist's name..."
                      onChange={e => setSearchKey(e.target.value)}
                      />
                    <Button variant="outline-success" type="submit">
                      Search
                    </Button>
                </InputGroup>
                  </Form>
                : <h2>Please login</h2>
            }
          </div>

          {isLoading
            ? <Spinner animation="border" variant="success"/>
            :  <div className='grid'>
                {renderArtists()}
              </div>
          }
      </div>
  );
}

export default App;
