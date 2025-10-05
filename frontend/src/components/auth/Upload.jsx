import React, { useState } from 'react';
import './Upload.css';

const Upload = () => {
  const [documents, setDocuments] = useState([
    { name: 'ID Document', fileName: '', file: null, status: 'Not Uploaded' },
    { name: 'Proof of Address', fileName: '', file: null, status: 'Not Uploaded' },
    { name: 'Bank Statement', fileName: '', file: null, status: 'Not Uploaded' }
  ]);

  const userId = 1; // Example userId; modify as needed

  const onFileChange = (event, index) => {
    const file = event.target.files[0];
    if (file) {
      setDocuments(prev => {
        const updated = [...prev];
        updated[index] = {
          ...updated[index],
          file: file,
          fileName: file.name,
          status: 'Uploaded'
        };
        return updated;
      });
    }
  };

  const removeFile = (index) => {
    setDocuments(prev => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        file: null,
        fileName: '',
        status: 'Not Uploaded'
      };
      return updated;
    });
  };

  const isFormValid = () => {
    return documents.every(doc => doc.file !== null);
  };

  const onSubmit = async () => {
    if (isFormValid()) {
      const uploadPromises = documents.map(async (doc) => {
        if (doc.file) {
          const formData = new FormData();
          formData.append('file', doc.file);
          formData.append('userId', userId.toString());
          formData.append('documentType', doc.name);

          try {
            // Replace with your actual upload endpoint
            const response = await fetch('/api/upload', {
              method: 'POST',
              body: formData
            });

            if (response.ok) {
              console.log(`${doc.name} uploaded successfully`);
              return { success: true, docName: doc.name };
            } else {
              throw new Error(`Failed to upload ${doc.name}`);
            }
          } catch (error) {
            console.error(`Error uploading ${doc.name}`, error);
            return { success: false, docName: doc.name, error };
          }
        }
      });

      try {
        const results = await Promise.all(uploadPromises);
        const allSuccess = results.every(result => result.success);
        
        if (allSuccess) {
          alert('Documents uploaded successfully!');
        } else {
          const failed = results.filter(result => !result.success);
          alert(`Failed to upload: ${failed.map(f => f.docName).join(', ')}`);
        }
      } catch (error) {
        console.error('Upload error:', error);
        alert('Failed to upload documents!');
      }
    } else {
      alert('Please upload all required documents.');
    }
  };

  return (
    <div className="upload-container">
      <h2>Document Upload</h2>
      <p>Please upload the following required documents:</p>
      
      <div className="documents-list">
        {documents.map((doc, index) => (
          <div key={index} className="document-item">
            <div className="document-info">
              <h3>{doc.name}</h3>
              <p className={`status ${doc.status.toLowerCase().replace(' ', '-')}`}>
                {doc.status}
              </p>
              {doc.fileName && <p className="filename">{doc.fileName}</p>}
            </div>
            
            <div className="document-actions">
              <input
                type="file"
                id={`file-${index}`}
                onChange={(e) => onFileChange(e, index)}
                accept=".pdf,.jpg,.jpeg,.png"
                style={{ display: 'none' }}
              />
              <label htmlFor={`file-${index}`} className="btn upload-btn">
                {doc.file ? 'Change File' : 'Choose File'}
              </label>
              {doc.file && (
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  className="btn remove-btn"
                >
                  Remove
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="submit-section">
        <button
          onClick={onSubmit}
          disabled={!isFormValid()}
          className={`btn submit-btn ${isFormValid() ? 'enabled' : 'disabled'}`}
        >
          Submit Documents
        </button>
      </div>
    </div>
  );
};

export default Upload;