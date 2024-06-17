import React, { useState, useEffect } from "react";
import axios from "axios";
import { Container, Switch } from "@mui/material";
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
  const [dbInitialized, setDbInitialized] = useState(false); // Track DB initialization

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
        setDbInitialized(true); // Set dbInitialized to true once the database is ready
      };
    };

    const checkNetworkStatus = () => {
      console.log("Network status:", navigator.onLine ? "Online" : "Offline");
    };

    initDB(); // Initialize IndexedDB
    checkNetworkStatus(); // Check network status on component mount
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
          setMeanings(storedData.meanings); // Update state with locally stored data
        } else {
          console.log("No data found locally for word:", word);
        }
      };

      request.onerror = function (event) {
        console.error("Error fetching from IndexedDB:", event.target.errorCode);
      };
    };

    const dictionaryApi = async () => {
      if (!db) {
        console.error("Database is not initialized");
        return;
      }

      try {
        const { data } = await axios.get(
          `https://api.dictionaryapi.dev/api/v2/entries/${category}/${word}`
        );
        const meaningsData = data;
        setMeanings(meaningsData);
        console.log("Data fetched from API:", meaningsData);

        // Store data in IndexedDB
        const transaction = db.transaction(["definitions"], "readwrite");
        const objectStore = transaction.objectStore("definitions");
        objectStore.put({ word, meanings: meaningsData });

        transaction.oncomplete = () => {
          console.log("Data stored in IndexedDB:", { word, meanings: meaningsData });
        };

        transaction.onerror = (event) => {
          console.error("Transaction error:", event.target.errorCode);
        };
      } catch (error) {
        console.error("Error fetching data:", error);
        fetchFromIndexedDB(); // Fetch from IndexedDB on error
      }
    };

    if (dbInitialized) {
      dictionaryApi(); // Fetch data only if the database is initialized
    }
  }, [word, category, dbInitialized]);

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
          setWord={setWord}
          category={category}
          setCategory={setCategory}
          word={word}
          setMeanings={setMeanings}
          LightTheme={LightTheme}
        />
        {meanings && (
          <Definitions
            meanings={meanings}
            word={word}
            LightTheme={LightTheme}
            category={category}
          />
        )}
      </Container>
      <Footer />
    </div>
  );
};

export default App;
