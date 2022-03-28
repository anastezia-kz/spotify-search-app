import axios from 'axios'
import Button from 'react-bootstrap/Button'
import React from 'react'
import Spinner from 'react-bootstrap/Spinner'

import ArtistCard from './components/ArtistCard'
import InputSearch from './components/InputSearch'
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
        <ArtistCard artist={artist} />
      ))
  }

  return (
      <div className="m-5">
          <header className="App-header">
            <div className="d-flex justify-content-center align-items-center">
              <h1>Spotify Search</h1>
              <img width="40px" height="40px" src={spotifyLogo} alt=""/>
            </div>
          </header>
          <div>
            {!token 
              ? <a className="btn btn-info" href={`${REACT_APP_AUTH_URL}?client_id=${REACT_APP_CLIENT_ID}&redirect_uri=${REACT_APP_REDIRECT_URI}&response_type=${REACT_APP_RESPONSE_TYPE}`}>
                  Login to Spotify
                </a>
                : <Button className="btn btn-success mb-3" onClick={logout}>Logout</Button>}

            {token 
              ? <InputSearch onSubmit={searchArtists} onChange={setSearchKey}/>
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
