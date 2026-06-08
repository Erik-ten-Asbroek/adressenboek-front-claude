import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

export function AddressForm({ onSubmit, getAddress }) {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);

  const [formData, setFormData] = useState({
    street: '',
    housenumber: '',
    addition: '',
    postalcode: '',
    city: '',
    country: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const isNederland = formData.country.trim().toLowerCase() === 'nederland';

  useEffect(() => {
    if (isEditing && getAddress) {
      setLoading(true);
      getAddress(id)
        .then(address => {
          if (address) {
            setFormData({
              street: address.street || '',
              housenumber: address.housenumber != null ? String(address.housenumber) : '',
              addition: address.addition || '',
              postalcode: address.postalcode || '',
              city: address.city || '',
              country: address.country || ''
            });
          } else {
            setError('Adres niet gevonden');
          }
        })
        .catch(() => setError('Adres laden mislukt'))
        .finally(() => setLoading(false));
    }
  }, [id, isEditing, getAddress]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const isNL = formData.country.trim().toLowerCase() === 'nederland';
    const missing = [];
    if (!formData.street.trim()) missing.push('Straat');
    if (!formData.housenumber.trim()) missing.push('Nummer');
    if (!formData.city.trim()) missing.push('Stad');
    if (!formData.country.trim()) missing.push('Land');
    if (isNL && !formData.postalcode.trim()) missing.push('Postcode');

    if (missing.length > 0) {
      setError(`Vul de verplichte velden in: ${missing.join(', ')}`);
      return;
    }

    try {
      setLoading(true);
      await onSubmit(isEditing ? id : null, formData);
      navigate('/');
    } catch (err) {
      setError('Adres opslaan mislukt');
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEditing) {
    return <div className="loading">Adres laden...</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="address-form">
      <h2>{isEditing ? 'Adres bewerken' : 'Adres toevoegen'}</h2>

      {error && <div className="error-message">{error}</div>}

      <div className="form-row">
        <div className="form-group form-group-large">
          <label htmlFor="street">Straat *</label>
          <input
            type="text"
            id="street"
            name="street"
            value={formData.street}
            onChange={handleChange}
            placeholder="Hoofdstraat"
            required
          />
        </div>

        <div className="form-group form-group-small">
          <label htmlFor="housenumber">Nummer *</label>
          <input
            type="text"
            id="housenumber"
            name="housenumber"
            value={formData.housenumber}
            onChange={handleChange}
            placeholder="123"
            required
          />
        </div>

        <div className="form-group form-group-small">
          <label htmlFor="addition">Toevoeging</label>
          <input
            type="text"
            id="addition"
            name="addition"
            value={formData.addition}
            onChange={handleChange}
            placeholder="A"
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group form-group-small">
          <label htmlFor="postalcode">Postcode{isNederland ? ' *' : ''}</label>
          <input
            type="text"
            id="postalcode"
            name="postalcode"
            value={formData.postalcode}
            onChange={handleChange}
            placeholder="1234AB"
            required={isNederland}
          />
        </div>

        <div className="form-group form-group-large">
          <label htmlFor="city">Stad *</label>
          <input
            type="text"
            id="city"
            name="city"
            value={formData.city}
            onChange={handleChange}
            placeholder="Amsterdam"
            required
          />
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="country">Land *</label>
        <input
          type="text"
          id="country"
          name="country"
          value={formData.country}
          onChange={handleChange}
          placeholder="Nederland"
          required
        />
      </div>

      <div className="form-actions">
        <button type="button" onClick={() => navigate('/')} className="btn btn-secondary">
          Annuleren
        </button>
        <button type="submit" disabled={loading} className="btn btn-primary">
          {loading ? 'Opslaan...' : (isEditing ? 'Bijwerken' : 'Adres toevoegen')}
        </button>
      </div>
    </form>
  );
}

export default AddressForm;
