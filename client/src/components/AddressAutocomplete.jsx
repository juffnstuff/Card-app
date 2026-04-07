import { useEffect, useRef, useState } from 'react';

let googleScriptLoaded = false;
let googleScriptLoading = false;
const loadCallbacks = [];

function loadGooglePlaces(apiKey) {
  if (googleScriptLoaded) return Promise.resolve();
  if (googleScriptLoading) {
    return new Promise((resolve) => loadCallbacks.push(resolve));
  }

  googleScriptLoading = true;
  return new Promise((resolve, reject) => {
    loadCallbacks.push(resolve);
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.onload = () => {
      googleScriptLoaded = true;
      googleScriptLoading = false;
      loadCallbacks.forEach((cb) => cb());
      loadCallbacks.length = 0;
    };
    script.onerror = () => {
      googleScriptLoading = false;
      reject(new Error('Failed to load Google Maps'));
    };
    document.head.appendChild(script);
  });
}

export default function AddressAutocomplete({ value, onChange, placeholder, className }) {
  const inputRef = useRef(null);
  const autocompleteRef = useRef(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const apiKey = window.__GOOGLE_MAPS_KEY;
    if (!apiKey) return;

    loadGooglePlaces(apiKey).then(() => setReady(true)).catch(() => {});
  }, []);

  useEffect(() => {
    if (!ready || !inputRef.current || autocompleteRef.current) return;

    const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, {
      types: ['address'],
      componentRestrictions: { country: 'us' },
    });

    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace();
      if (place?.formatted_address) {
        onChange(place.formatted_address);
      }
    });

    autocompleteRef.current = autocomplete;
  }, [ready]);

  return (
    <input
      ref={inputRef}
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={className}
    />
  );
}
