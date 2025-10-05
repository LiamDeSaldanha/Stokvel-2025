import React, { useState } from 'react';
import './Upload.css';

const Upload = () => {
  const [documents, setDocuments] = useState([
    {
      name: 'ID Document / Passport',
      fileName: '',
      file: null,
      status: 'Pending'
    },
    {
      name: 'Proof of Address',
      fileName: '',
      file: null,
      status: 'Pending'
    },
    {
      name: 'Bank Statement',
      fileName: '',
      file: null,
      status: 'Pending'
    }
  ]);

  const onFileChange = (event, index) => {
    const file = event.target.files[0];
    if (file) {
      const updatedDocuments = [...documents];
      updatedDocuments[index] = {
        ...updatedDocuments[index],
        fileName: file.name,
        file: file,
        status: 'Ready for upload'
      };
      setDocuments(updatedDocuments);
    }
  };

  const removeFile = (index) => {
    const updatedDocuments = [...documents];
    updatedDocuments[index] = {
      ...updatedDocuments[index],
      fileName: '',
      file: null,
      status: 'Pending'
    };
    setDocuments(updatedDocuments);
  };

  const isFormValid = () => {
    return documents.some(doc => doc.file !== null);
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    
    if (!isFormValid()) {
      alert('Please select at least one file to upload.');
      return;
    }

    try {
      // TODO: Implement actual file upload logic
      console.log('Documents to upload:', documents.filter(doc => doc.file));
      
      // Simulate upload process
      const updatedDocuments = documents.map(doc => ({
        ...doc,
        status: doc.file ? 'Uploaded successfully' : doc.status
      }));
      
      setDocuments(updatedDocuments);
      alert('Documents uploaded successfully!');
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Upload failed. Please try again.');
    }
  };

  return (
    <div className="upload-container">
      <h2>Document Verification</h2>
      <p>
        Please upload the required documents to verify your identity and start using
        stokvel services.
      </p>

      <form onSubmit={onSubmit}>
        {documents.map((document, index) => (
          <div className="form-group" key={index}>
            <div className="document-section">
              <div className="document-title">
                <i className="fas fa-info-circle"></i>
                <label>{document.name}</label>
              </div>
              <div className="upload-section">
                <input
                  type="file"
                  onChange={(e) => onFileChange(e, index)}
                  id={`file${index}`}
                  accept=".pdf,.jpg,.jpeg,.png"
                />
                <span>{document.fileName || "No file chosen"}</span>
                {document.fileName && (
                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                  >
                    Remove
                  </button>
                )}
              </div>
              <span className="status">{document.status}</span>
            </div>
          </div>
        ))}

        <button 
          type="submit" 
          disabled={!isFormValid()} 
          className="btn btn-primary"
        >
          Submit for Verification
        </button>
      </form>
    </div>
  );
};

export default Upload;