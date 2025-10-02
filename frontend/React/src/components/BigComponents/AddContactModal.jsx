import { FaTimes, FaVideo } from "react-icons/fa";
import { addContactThunk, isContactAvailibleThunk } from "../../store/slices/contactsSlice";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import styles from "../../assets/ChatPage.module.css";
import Input from "../Input";
// ---------- Add Contact Modal ----------
function AddContactModal({ isOpen, onClose }) {
    const { userObject } = useSelector((state) => state.auth);
    const id= userObject.id;
  const dispatch=useDispatch();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [showMessage, setShowMessage] = useState("");
  const [savedAs, setSavedAs] = useState("");
  const handleSaveAsChange=(e)=>{
    e.preventDefault();
    setSavedAs(e.target.value);

  }

  const handleChange = (e) => {
    let val = e.target.value;
    if (!val.startsWith("034")) val = "034"; // force prefix
    val = val.slice(0, 11); // max 11 digits
    val = val.replace(/\D/g, ""); // only numbers
    setPhoneNumber(val);
    if(val.length<11){
      setShowMessage("");
    }
  
  };


  const handleSubmit = (e) => {
    e.preventDefault();
    if (phoneNumber.length === 11) {
      setShowMessage(`Adding contact: ${phoneNumber}`);
      const contact = {
        phoneNumber,
        savedAs: savedAs || "New Contact",
        id,
      };  
   
      dispatch(addContactThunk(contact)).then((res) => {
        console.log('Response from addContactThunk:', res);
        if (res.payload && res.payload.message) {
          setShowMessage(res.payload.message);
          if (res.payload.success) {
            setSavedAs("");
            setPhoneNumber("");
            setTimeout(() => {
              onClose();
            }, 1000);
          }
        } else if (res.error && res.error.message) {
          setShowMessage(res.error.message);
        } else {
          setShowMessage('An unexpected error occurred.');
        }
      });
    }
  };
  useEffect(() => {
    if (phoneNumber.length === 11) {
      dispatch(isContactAvailibleThunk(phoneNumber)).then((res) => {
        console.log('Response from isContactAvailibleThunk:', res);
        if (res.payload && res.payload.message) {
          setShowMessage(res.payload.message);
        } else if (res.error && res.error.message) {
          setShowMessage(res.error.message);
        } else {
          setShowMessage('An unexpected error occurred.');
        }
      });
    }
  }, [phoneNumber]);


  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <h2>Add New Contact</h2>
        <form onSubmit={handleSubmit} className={styles.modalForm}>
          <Input label="Save As" type="text" placeholder="Enter contact name"  onChange={handleSaveAsChange} value={savedAs}/>
          <Input
            label="Phone Number"
            type="text"
            value={phoneNumber}
            onChange={handleChange}
            placeholder="034xxxxxxxx"
          />
          {showMessage && <p className={`${showMessage ==="User Available"?styles.success:styles.error}`}>{showMessage}</p>}
          <button type="submit" disabled={ showMessage !== "User Available" } className={styles.modalButton}>Add</button>
        </form>
        {/* will use react icon used */}
        <button className={styles.closeModal} onClick={onClose}><FaTimes /></button>
      </div>
    </div>
  );
}
export default AddContactModal;