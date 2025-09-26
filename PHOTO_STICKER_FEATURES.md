# Photo and Sticker Sending Features

This document describes the newly added photo and sticker sending functionality to the QuickChat MERN application.

## Features Added

### 1. Photo Sending
- Users can upload and send images in chat conversations
- Support for common image formats (JPG, PNG, GIF, WebP)
- 5MB file size limit for images
- Images are stored locally in the `uploads/images/` directory
- Images are displayed inline in the chat with proper sizing

### 2. Sticker Sending
- Users can upload custom stickers or choose from a predefined collection
- Support for common image formats (JPG, PNG, GIF, WebP, SVG)
- 2MB file size limit for stickers
- Stickers are stored locally in the `uploads/stickers/` directory
- Stickers are displayed inline in the chat with smaller sizing (150x150px max)

### 3. UI Components
- **Attachment Button**: Added to the chat input area for easy access
- **Upload Modal**: Modal dialog for selecting and sending media files
- **Sticker Picker**: Component for choosing from predefined sticker collection
- **File Upload**: Drag-and-drop or click-to-upload functionality

## Technical Implementation

### Backend Changes

#### 1. Message Model (`models/message.js`)
- Already supported different message types: `text`, `image`, `sticker`
- Added `mediaUrl` field for storing file paths

#### 2. Upload Middleware (`middleware/upload.js`)
- Created multer configuration for file uploads
- Separate storage for images and stickers
- File validation and size limits
- Automatic directory creation

#### 3. Message Controller (`controllers/message.js`)
- Updated `sendMessage` function to handle different message types
- Added support for file uploads with proper URL generation
- Enhanced validation for different message types

#### 4. Message Routes (`routes/message.js`)
- Added new routes for image and sticker uploads:
  - `POST /api/v1/message/image` - Upload and send images
  - `POST /api/v1/message/sticker` - Upload and send stickers

#### 5. Server Configuration (`server.js`)
- Added static file serving for uploaded files
- Files accessible via `/uploads/` endpoint

### Frontend Changes

#### 1. SingleChat Component (`client/src/components/SingleChat.js`)
- Added attachment button to chat input
- Implemented file upload modal
- Added functions for sending images and stickers
- Integrated with existing socket.io real-time messaging

#### 2. ScrollableChat Component (`client/src/components/ScrollableChat.js`)
- Updated message rendering to support different message types
- Added proper display for images and stickers
- Maintained existing chat bubble styling

#### 3. StickerPicker Component (`client/src/components/StickerPicker.js`)
- New component for selecting from predefined sticker collection
- Grid layout for easy sticker selection
- Integration with file upload system

## Usage Instructions

### Sending Photos
1. Click the attachment button (📎) in the chat input area
2. In the modal, click "Choose File" under "Send Image"
3. Select an image file from your device
4. Preview the image and click "Send Image"

### Sending Stickers
1. Click the attachment button (📎) in the chat input area
2. In the modal, either:
   - Click "Choose from Collection" to select from predefined stickers
   - Click "Choose File" to upload a custom sticker
3. Preview the sticker and click "Send Sticker"

### Viewing Media
- Images and stickers appear inline in the chat
- Images are displayed with a maximum size of 300x250px
- Stickers are displayed with a maximum size of 150x150px
- All media maintains aspect ratio and is properly contained

## File Structure

```
uploads/
├── images/          # Uploaded photos
└── stickers/        # Uploaded stickers

client/src/components/
├── SingleChat.js    # Main chat component with upload functionality
├── ScrollableChat.js # Message display component
└── StickerPicker.js # Sticker selection component
```

## Dependencies Added

### Backend
- `multer` - File upload handling
- `multer-storage-cloudinary` - Cloud storage (optional, currently using local storage)

### Frontend
- `react-file-base64` - File upload component (already present)

## Future Enhancements

1. **Cloud Storage**: Integrate with Cloudinary or AWS S3 for production
2. **Image Compression**: Add automatic image compression before upload
3. **Sticker Categories**: Organize stickers into categories
4. **Custom Sticker Creation**: Allow users to create custom stickers
5. **Media Gallery**: Add a media gallery view for chat history
6. **File Management**: Add file deletion and management features

## Security Considerations

- File type validation on both frontend and backend
- File size limits to prevent abuse
- Proper error handling for upload failures
- Static file serving with appropriate headers

## Testing

To test the functionality:
1. Start the backend server: `npm start`
2. Start the frontend: `cd client && npm start`
3. Login to the application
4. Start a chat conversation
5. Use the attachment button to send photos and stickers
6. Verify that media appears correctly in the chat
