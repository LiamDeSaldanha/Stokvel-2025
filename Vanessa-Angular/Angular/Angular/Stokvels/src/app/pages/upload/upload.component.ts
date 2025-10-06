import { Component } from '@angular/core';
import { UploadService } from '../../core/services/upload.service';
import { CommonModule } from '@angular/common'; // Import CommonModule for ngFor and ngIf

@Component({
  selector: 'app-upload',
  standalone: true, // This makes it a standalone component
  imports: [CommonModule], // Import CommonModule here
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.css']
})
export class UploadComponent {
  documents = [
    { name: 'ID Document', fileName: '', file: null, status: 'Not Uploaded' },
    { name: 'Proof of Address', fileName: '', file: null, status: 'Not Uploaded' },
    { name: 'Bank Statement', fileName: '', file: null, status: 'Not Uploaded' }
  ];

  userId: number = 1; // Example userId; modify as needed

  constructor(private uploadService: UploadService) {}

  onFileChange(event: any, index: number): void {
    const file = event.target.files[0];
    if (file) {
      this.documents[index].file = file;
      this.documents[index].fileName = file.name;
      this.documents[index].status = 'Uploaded';
    }
  }

  removeFile(index: number): void {
    this.documents[index].file = null;
    this.documents[index].fileName = '';
    this.documents[index].status = 'Not Uploaded';
  }

  isFormValid(): boolean {
    return this.documents.every(doc => doc.file !== null);
  }

  onSubmit(): void {
    if (this.isFormValid()) {
      this.documents.forEach(doc => {
        if (doc.file) {
          this.uploadService.uploadDocument(this.userId, doc.file, doc.name).subscribe(
            response => {
              console.log(`${doc.name} uploaded successfully`, response);
              alert('Documents uploaded successfully!');
            },
            error => {
              console.error(`Error uploading ${doc.name}`, error);
              alert(`Failed to upload ${doc.name}!`);
            }
          );
        }
      });
    } else {
      alert('Please upload all required documents.');
    }
  }
}
