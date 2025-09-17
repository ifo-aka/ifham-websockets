import { createSlice } from "@reduxjs/toolkit";


const contactSlice= createSlice({
    name: "contact",
    initialState:  {
        contacts : [
            {
                savedAs: "Ifham",
                phoneNumber: "034394464267"


        }
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
    }


})

export const contactActions= contactSlice.actions;
export default contactSlice.reducer;