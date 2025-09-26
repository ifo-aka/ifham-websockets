// store/slices/chatSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getUnreadMessages,
  getAllConversations,
} from "../../utils/DBUtils";
import { normalizeIncoming } from "../../utils/messageUtils";

/* ---------- Thunks ---------- */
export const getUnreadMessagesThunk = createAsyncThunk(
  "chat/getUnreadMessages",
  async (phoneNumber, { rejectWithValue }) => {
    try {
      const res = await getUnreadMessages(phoneNumber);
      if (res?.success === false) return rejectWithValue(res.message);
      return { data: res?.data || [], myPhone: phoneNumber };
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const getAllConversationsThunk = createAsyncThunk(
  "chat/getAllConversations",
  async (phoneNumber, { rejectWithValue }) => {
    try {
      const res = await getAllConversations(phoneNumber);
      if (res?.success === false) return rejectWithValue(res.message);
      return { data: res?.data || [], myPhone: phoneNumber };
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

/* ---------- Initial State ---------- */
const initialState = {
  messagesByContact: {}, // { contactPhone: [messages...] }
  loading: false,
  error: null,
};

/* ---------- Slice ---------- */
const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    addMessage: (state, action) => {
      const msg = action.payload;
      const contactPhone =
        msg.senderPhone === msg.myPhone
          ? msg.receiverPhone
          : msg.senderPhone;

      if (!state.messagesByContact[contactPhone]) {
        state.messagesByContact[contactPhone] = [];
      }

      // avoid duplicates by id
      const alreadyExists = state.messagesByContact[contactPhone].some(
        (m) => m.id === msg.id
      );
      if (!alreadyExists) {
        state.messagesByContact[contactPhone].push(msg);
      }
    },
    updateMessageStatus: (state, action) => {
      const { messageId, status, contactPhone } = action.payload;
      if (!state.messagesByContact[contactPhone]) return;

      const msg = state.messagesByContact[contactPhone].find(
        (m) => m.id === messageId
      );
      if (msg) {
        msg.status = status;
      }
    },
    clearChat: (state, action) => {
      const contactPhone = action.payload;
      delete state.messagesByContact[contactPhone];
    },
  },
  extraReducers: (builder) => {
    builder
      // getUnreadMessages
      .addCase(getUnreadMessagesThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getUnreadMessagesThunk.fulfilled, (state, action) => {
        state.loading = false;
        const { data, myPhone } = action.payload;
        const normalizedData = data.map(normalizeIncoming);

        normalizedData.forEach((msg) => {
          const contactPhone =
            msg.senderPhone === myPhone
              ? msg.receiverPhone
              : msg.senderPhone;
          if (!state.messagesByContact[contactPhone]) {
            state.messagesByContact[contactPhone] = [];
          }
          const alreadyExists = state.messagesByContact[contactPhone].some(
            (m) => m.id === msg.id
          );
          if (!alreadyExists) {
            state.messagesByContact[contactPhone].push(msg);
          }
        });
      })
      .addCase(getUnreadMessagesThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })

      // getAllConversations
      .addCase(getAllConversationsThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllConversationsThunk.fulfilled, (state, action) => {
        state.loading = false;
        const { data, myPhone } = action.payload;
        const normalizedData = data.map(normalizeIncoming);

        normalizedData.forEach((msg) => {
          const contactPhone =
            msg.senderPhone === myPhone
              ? msg.receiverPhone
              : msg.senderPhone;
          if (!state.messagesByContact[contactPhone]) {
            state.messagesByContact[contactPhone] = [];
          }
          const alreadyExists = state.messagesByContact[contactPhone].some(
            (m) => m.id === msg.id
          );
          if (!alreadyExists) {
            state.messagesByContact[contactPhone].push(msg);
          }
        });
      })
      .addCase(getAllConversationsThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      });
  },
});

/* ---------- Exports ---------- */
export const { addMessage, updateMessageStatus, clearChat } =
  chatSlice.actions;

export default chatSlice.reducer;
