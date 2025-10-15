import FileUploader from '../FileUploader';

export default function FileUploaderExample() {
  return (
    <div className="p-6 space-y-4">
      <h3 className="text-lg font-semibold">File Uploader Example</h3>
      <p className="text-sm text-muted-foreground">
        Click the button to test the file upload functionality
      </p>
      <FileUploader 
        controlId="DEMO-001" 
        onUploadComplete={(evidence) => console.log('Upload completed:', evidence)}
      />
    </div>
  );
}