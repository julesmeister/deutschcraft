export const IssueDescription = () => (
  <div className="space-y-4">
    <p>
      Users are experiencing issues when trying to upload files larger than 5MB. The upload
      process starts but gets stuck at around 80% completion.
    </p>
    <p>
      <strong>Steps to reproduce:</strong>
    </p>
    <ol className="list-decimal list-inside space-y-1 ml-4">
      <li>Navigate to the file upload section</li>
      <li>Select a file larger than 5MB</li>
      <li>Click the upload button</li>
      <li>Observe the progress bar getting stuck at ~80%</li>
    </ol>
    <p>
      <strong>Expected behavior:</strong> Files should upload successfully regardless of size
      (up to the 50MB limit).
    </p>
    <p>
      <strong>Actual behavior:</strong> Upload process hangs and eventually times out for
      files larger than 5MB.
    </p>
  </div>
);
