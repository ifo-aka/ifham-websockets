import { use, useEffect, useLayoutEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import SockJS from "sockjs-client";
import { over } from "stompjs";
import { AppContext } from "./AppContext";
import notificationSound from "../utils/notification.wav";
import { addMessage } from "../store/slices/chatSlice";
import { increment } from "../store/slices/notificationSlice";


import {refreshTokenThunk} from "../store/slices/authSlics"
import {

  setIsMobileDimention,
  setIsDesktopDimention,
} from "../store/slices/uiSlice";
import { getContactsThunk } from "../store/slices/contactsSlice";
import { openDB } from 'idb';

// IndexedDB utility functions for contacts
const dbPromise = openDB('ContactsDB', 1, {
  upgrade(db) {
    if (!db.objectStoreNames.contains('contacts')) {
      db.createObjectStore('contacts', { keyPath: 'id' }); // Use database id as key
    }
  },
});

export async function addContactToDB(contact) {
  const db = await dbPromise;
  await db.put('contacts', contact); // Adds or updates contact by id
}

export async function getAllContactsFromDB() {
  const db = await dbPromise;
  return await db.getAll('contacts');
}

export async function updateContactInDB(contact) {
  const db = await dbPromise;
  await db.put('contacts', contact); // Updates contact by id
}

export async function deleteContactFromDB(contactId) {
  const db = await dbPromise;
  await db.delete('contacts', contactId); // Deletes contact by id
}


const AppContextProvider = ({ children }) => {
  const dispatch = useDispatch();
  const {userObject={}} = useSelector((s)=>s.auth);
  const stompClientRef = useRef(null);
  const audioRef = useRef(new Audio(notificationSound));
   const prevWidth = useRef(window.innerWidth)

   useEffect(()=>{
    const asyncfun= async()=>{
    const  contacts =await getAllContactsFromDB();
    console.log(contacts)

    }
asyncfun();

   },[])

  useEffect(() => {
    // 🟢 WebSocket + STOMP setup
    const socket = new SockJS("http://localhost:8080/ws/chat");
    const client = over(socket);
    stompClientRef.current = client;

    client.connect({}, () => {
      console.log("✅ Connected to WebSocket");

      client.subscribe("/topic/messages", (msg) => {
        const received = JSON.parse(msg.body);

        // Save message in Redux
        dispatch(addMessage(received));

        // Play notification if window is not focused
        if (!document.hasFocus() && received.from !== "Bot") {
          audioRef.current.play().catch(() => {});
          dispatch(increment());
        }
      });
    });

    return () => {
      if (stompClientRef.current) {
        stompClientRef.current.disconnect(() => console.log("❌ WebSocket disconnected"));
      }
    };
  }, [dispatch]);


useEffect(() => {
  // Run immediately at mount
  dispatch(refreshTokenThunk());

  // Then repeat every 9 minutes
  const interval = setInterval(() => {
    dispatch(refreshTokenThunk());
  }, 9 * 60 * 1000);

  // Cleanup on unmount
  return () => clearInterval(interval);
}, [dispatch]);

  useLayoutEffect(() => {
    const width = window.innerWidth;
    if (width < 950) {
      dispatch(setIsMobileDimention(true));
    } else {
      dispatch(setIsDesktopDimention(true));
    }
  
  }, []);

  // resize handler
  useEffect(() => {
    const handleResize = () => {
      console.log(prevWidth.current);
      const currentWidth = window.innerWidth;
      const wasMobile = prevWidth.current < 950;
      const isNowMobile = currentWidth < 950;
      if (wasMobile !== isNowMobile) {
        if (isNowMobile) dispatch(setIsMobileDimention(true));
        else dispatch(setIsDesktopDimention(true));
      }
      console.log(wasMobile +" and "+ isNowMobile);
      
      prevWidth.current = currentWidth;
    
    };

    window.addEventListener("resize", handleResize);
    return () =>{
       window.removeEventListener("resize", handleResize);
      
      }
  }, [dispatch]);
  useEffect(() => {
    if(userObject.id){
     dispatch(getContactsThunk(userObject.id)).then((res)=>{
      console.log(res)
        if(res.payload.success){
        // Save contacts to IndexedDB for offline access using database id as key
        (async () => {
          try {
            const db = await dbPromise;
            // Clear previous contacts
            const txClear = db.transaction('contacts', 'readwrite');
            await txClear.objectStore('contacts').clear();
            await txClear.done;
            // Add new contacts
            for (const contact of res.payload.data) {
              await db.put('contacts', contact); // Uses id from backend
            }
            console.log('Contacts saved to IndexedDB');
          } catch (e) {
            console.error('Failed to save contacts to IndexedDB', e);
          }
        })();
        
        }
     }).catch((err)=>{
       console.log(err)
     })
    }

  },[userObject.id,dispatch])


  return (
    <AppContext.Provider value={{ stompClient: stompClientRef }}>
      {children}
    </AppContext.Provider>
  );
};

export default AppContextProvider;
