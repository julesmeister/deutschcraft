'use client';

interface PostMediaProps {
  urls: string[];
  type?: 'image' | 'video' | 'poll' | 'none';
}

export default function PostMedia({ urls, type = 'image' }: PostMediaProps) {
  if (!urls || urls.length === 0) return null;

  if (type === 'video') {
    return (
      <div className="mt-3">
        <video className="card-img rounded" controls>
          <source src={urls[0]} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>
    );
  }

  if (urls.length === 1) {
    return (
      <div className="mt-3">
        <img src={urls[0]} alt="Post media" className="card-img rounded img-fluid" />
      </div>
    );
  }

  if (urls.length === 2) {
    return (
      <div className="d-flex justify-content-between mt-3 g-3 row">
        {urls.map((url, index) => (
          <div key={index} className="col-6">
            <img src={url} alt={`Post media ${index + 1}`} className="rounded img-fluid" />
          </div>
        ))}
      </div>
    );
  }

  if (urls.length === 3) {
    return (
      <div className="d-flex justify-content-between mt-3">
        <div className="g-3 row">
          <div className="col-6">
            <img src={urls[0]} alt="Post media 1" className="rounded img-fluid h-100" style={{ objectFit: 'cover' }} />
          </div>
          <div className="col-6">
            <img src={urls[1]} alt="Post media 2" className="rounded img-fluid mb-3" />
            <img src={urls[2]} alt="Post media 3" className="rounded img-fluid" />
          </div>
        </div>
      </div>
    );
  }

  // 4 or more images
  return (
    <div className="d-flex justify-content-between mt-3">
      <div className="g-3 row">
        <div className="col-6">
          <img src={urls[0]} alt="Post media 1" className="rounded img-fluid" />
        </div>
        <div className="col-6">
          <img src={urls[1]} alt="Post media 2" className="rounded img-fluid" />
        </div>
        <div className="col-6">
          <img src={urls[2]} alt="Post media 3" className="rounded img-fluid" />
        </div>
        <div className="col-6 position-relative">
          <img src={urls[3]} alt="Post media 4" className="rounded img-fluid" />
          {urls.length > 4 && (
            <div className="position-absolute top-0 start-0 w-100 h-100 bg-dark bg-opacity-50 rounded d-flex align-items-center justify-content-center">
              <span className="text-white fw-bold fs-4">+{urls.length - 4}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
