import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Container, Switch, CircularProgress, LinearProgress, Button } from "@mui/material";
import { styled } from "@mui/system";
import { grey } from "@mui/material/colors";
import Definitions from "./components/Definitions/Definitions";
import Footer from "./components/Footer/Footer";
import Header from "./components/header/Header";

let indexedDB;
let db;

if (typeof window !== "undefined") {
  indexedDB =
    window.indexedDB ||
    window.mozIndexedDB ||
    window.webkitIndexedDB ||
    window.msIndexedDB;
}

const App = () => {
  const [word, setWord] = useState("");
  const [meanings, setMeanings] = useState([]);
  const [category, setCategory] = useState("en");
  const [LightTheme, setLightTheme] = useState(false);
  const [dbInitialized, setDbInitialized] = useState(false);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [downloadBackground, setDownloadBackground] = useState(false);
  const [showLoader, setShowLoader] = useState(false);
  const cancelTokenSource = useRef(axios.CancelToken.source());
  const debounceRef = useRef(null);
  const wordsToDownloadRef = useRef([]);

  useEffect(() => {
    const initDB = () => {
      if (!indexedDB) {
        console.error("IndexedDB is not supported in this browser");
        return;
      }

      const request = indexedDB.open("dictionaryDB", 1);

      request.onerror = function (event) {
        console.error("Error opening database:", event.target.errorCode);
      };

      request.onupgradeneeded = function (event) {
        const db = event.target.result;
        db.createObjectStore("definitions", { keyPath: "word" });
      };

      request.onsuccess = function (event) {
        db = event.target.result;
        console.log("IndexedDB initialized");
        setDbInitialized(true);
      };
    };

    const checkNetworkStatus = () => {
      console.log("Network status:", navigator.onLine ? "Online" : "Offline");
    };

    initDB();
    checkNetworkStatus();
  }, []);

  useEffect(() => {
    const fetchFromIndexedDB = () => {
      if (!db) {
        console.error("Database is not initialized");
        return;
      }

      const transaction = db.transaction(["definitions"], "readonly");
      const objectStore = transaction.objectStore("definitions");
      const request = objectStore.get(word);

      request.onsuccess = function (event) {
        const storedData = event.target.result;
        if (storedData) {
          console.log("Data fetched from IndexedDB:", storedData);
          setMeanings(storedData.meanings);
          setLoading(false);
        } else {
          console.log("No data found locally for word:", word);
          fetchFromAPI(); // Fetch from API when data is not found in IndexedDB
        }
      };

      request.onerror = function (event) {
        console.error("Error fetching from IndexedDB:", event.target.errorCode);
        setLoading(false);
      };
    };

    const fetchFromAPI = async (wordToFetch = word) => {
      if (!db) {
        console.error("Database is not initialized");
        return;
      }

      setLoading(true);
      try {
        const { data } = await axios.get(
          `https://api.dictionaryapi.dev/api/v2/entries/${category}/${wordToFetch}`
        );
        setMeanings(data);
        console.log("Data fetched from API:", data);

        const transaction = db.transaction(["definitions"], "readwrite");
        const objectStore = transaction.objectStore("definitions");
        objectStore.put({ word: wordToFetch, meanings: data });

        transaction.oncomplete = () => {
          console.log(`Data for "${wordToFetch}" stored in IndexedDB`);
        };

        transaction.onerror = (event) => {
          console.error("Transaction error:", event.target.errorCode);
        };
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    const preloadWordsFromTxt = async () => {
      setDownloading(true);
      setShowLoader(true); // Show loader when download starts
      try {
        const response = await axios.get("/english.txt");
        const words = response.data.split("\n").map((word) => word.trim()).filter(Boolean);
        wordsToDownloadRef.current = words;

        for (let i = 0; i < words.length; i++) {
          if (cancelTokenSource.current?.token.reason) {
            console.log("Download cancelled");
            setDownloading(false);
            return;
          }

          const word = words[i];
          await fetchFromAPI(word);
          setProgress(((i + 1) / words.length) * 100);

          if (downloadBackground) {
            await new Promise((resolve) => setTimeout(resolve, 1)); // Delay to avoid blocking the UI
          }
        }
      } catch (error) {
        if (axios.isCancel(error)) {
          console.log("Download cancelled by user");
        } else {
          console.error("Error loading words from text file:", error);
        }
      } finally {
        setDownloading(false);
        setShowLoader(false); // Hide loader when download completes or is cancelled
      }
    };

    if (dbInitialized && word) {
      fetchFromIndexedDB();
    }

    if (dbInitialized && !downloading) {
      preloadWordsFromTxt(); // Start preloading words when database is initialized and not currently downloading
    }
  }, [word, category, dbInitialized, downloading, downloadBackground]);

  const handleWordChange = (newWord) => {
    setWord(newWord);
  };

  const handleInputChange = (newWord) => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    debounceRef.current = setTimeout(() => {
      handleWordChange(newWord);
    }, 500); // Adjust debounce delay as needed
  };

  const handleBackgroundDownload = () => {
    setDownloadBackground(true);
    setShowLoader(false); // Hide loader when background download starts
  };

  const handleCancelDownload = () => {
    if (cancelTokenSource.current) {
      cancelTokenSource.current.cancel("Download cancelled by user");
      setDownloading(false);
      setShowLoader(false); // Hide loader on cancellation
    }
  };

  const PurpleSwitch = styled(Switch)(({ theme }) => ({
    '& .MuiSwitch-switchBase': {
      color: grey[50],
      '&.Mui-checked': {
        color: grey[900],
        '& + .MuiSwitch-track': {
          backgroundColor: grey[500],
        },
      },
    },
    '& .MuiSwitch-track': {
      backgroundColor: grey[50],
    },
  }));

  return (
    <div
      className="App"
      style={{
        height: "100vh",
        backgroundColor: LightTheme ? "#fff" : "#282c34",
        color: LightTheme ? "black" : "white",
        transition: "all 0.5s linear",
      }}
    >
      <Container
        maxWidth="md"
        style={{
          display: "flex",
          flexDirection: "column",
          height: "100vh",
          justifyContent: "space-evenly",
        }}
      >
        <div
          style={{ position: "absolute", top: 0, right: 15, paddingTop: 10 }}
        >
          <span>{LightTheme ? "Dark" : "Light"} Mode</span>
          <PurpleSwitch
            checked={LightTheme}
            onChange={() => setLightTheme(!LightTheme)}
          />
        </div>
        <Header
          setWord={handleInputChange}
          category={category}
          setCategory={setCategory}
          word={word}
          setMeanings={setMeanings}
          LightTheme={LightTheme}
        />
        {loading ? (
          <CircularProgress style={{ margin: "auto" }} />
        ) : (
          meanings && (
            <Definitions
              meanings={meanings}
              word={word}
              LightTheme={LightTheme}
              category={category}
            />
          )
        )}
      </Container>
      {downloading && !downloadBackground && showLoader && (
        <div style={{ position: "absolute", bottom: 10, left: 0, right: 0 }}>
          <LinearProgress variant="determinate" value={progress} />
          <div style={{ textAlign: "center", marginTop: 10 }}>
            Downloading data... {Math.round(progress)}%
            <Button onClick={handleBackgroundDownload} style={{ marginLeft: 10 }}>
              Background
            </Button>
            <Button onClick={handleCancelDownload} style={{ marginLeft: 10 }}>
              Cancel
            </Button>
          </div>
        </div>
      )}
      <Footer />
    </div>
  );
};

export default App;

