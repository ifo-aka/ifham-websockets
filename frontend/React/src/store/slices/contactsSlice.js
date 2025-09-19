import { createSlice } from "@reduxjs/toolkit";
import {addContact,deleteContact,getContacts} from "../../utils/DBUtils";
import { createAsyncThunk } from "@reduxjs/toolkit";

// Thunks
//AddContact thunk will send logged user id in request params and user to save in body for this api     @PostMapping("/{userId}/contacts") 
export const addContactThunk = createAsyncThunk(
    "/api/user/{userId}/contacts",
     async(contact,{ rejectWithValue })=>{
        console.log(contact)
        try {
            const response= await addContact({savedAs: contact.saveAs, phoneNumber: contact.phoneNumber}, contact.id);
            console.log(response);
            if(!response.success){
                return rejectWithValue(response)
            }
            return response;

     }catch (error) {
            return rejectWithValue("Network error or server is unreachable.");
        }
    }
)
export const getContactsThunk=createAsyncThunk(
    "/api/contacts",
    async(userId,{rejectWithValue})=>{
        try {
            const response= await getContacts(userId);
            console.log(response);
            if(!response.success){
                rejectWithValue(response)
            }
            return response;
        }
        catch (error) {
            return rejectWithValue("Network error or server is unreachable.");
        }
    }
)

const contactSlice= createSlice({
    name: "contact",
    initialState:  {
        contacts : [
            {}

        ]
          
    },
    reducers:{
        addContact: (state,action)=>{
            state.contacts.push(action.payload)
        },
        removeContact:(state,action)=>{
            state.contacts.filter((item)=>{
                item.phoneNumber!=action.payload
            })

        }
    },
    extraReducers:(builder)=>{
        builder
        .addCase(addContactThunk.fulfilled,(state,action)=>{
            state.contacts.push(action.payload.data)
        })
        .addCase(addContactThunk.rejected,(state,action)=>{
            console.log("Failed to add contact: ", action.payload)
        })
        .addCase(getContactsThunk.fulfilled,(state,action)=>{
            state.contacts=action.payload.data;
        })
        .addCase(getContactsThunk.rejected,(state,action)=>{
            console.log("Failed to fetch contacts: ", action.payload)
        })

    }

    


})

export const contactActions= contactSlice.actions;
export default contactSlice.reducer;