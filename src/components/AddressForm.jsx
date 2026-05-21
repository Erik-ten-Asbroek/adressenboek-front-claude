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

  useEffect(() => {
    if (isEditing && getAddress) {
      setLoading(true);
      getAddress(id)
        .then(address => {
          if (address) {
            setFormData({
              street: address.street || '',
              housenumber: address.housenumber || '',
              addition: address.addition || '',
              postalcode: address.postalcode || '',
              city: address.city || '',
              country: address.country || ''
            });
          } else {
            setError('Address not found');
          }
        })
        .catch(() => setError('Failed to load address'))
        .finally(() => setLoading(false));
    }
  }, [id, isEditing, getAddress]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.street.trim() || !formData.housenumber.trim()) {
      setError('Street and house number are required');
      return;
    }

    try {
      setLoading(true);
      await onSubmit(isEditing ? id : null, formData);
      navigate('/');
    } catch (err) {
      setError('Failed to save address');
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEditing) {
    return <div className="loading">Loading address...</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="address-form">
      <h2>{isEditing ? 'Edit Address' : 'Add Address'}</h2>

      {error && <div className="error-message">{error}</div>}

      <div className="form-row">
        <div className="form-group form-group-large">
          <label htmlFor="street">Street *</label>
          <input
            type="text"
            id="street"
            name="street"
            value={formData.street}
            onChange={handleChange}
            placeholder="Main Street"
            required
          />
        </div>

        <div className="form-group form-group-small">
          <label htmlFor="housenumber">Number *</label>
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
          <label htmlFor="addition">Addition</label>
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
          <label htmlFor="postalcode">Postal Code</label>
          <input
            type="text"
            id="postalcode"
            name="postalcode"
            value={formData.postalcode}
            onChange={handleChange}
            placeholder="12345"
          />
        </div>

        <div className="form-group form-group-large">
          <label htmlFor="city">City</label>
          <input
            type="text"
            id="city"
            name="city"
            value={formData.city}
            onChange={handleChange}
            placeholder="Amsterdam"
          />
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="country">Country</label>
        <input
          type="text"
          id="country"
          name="country"
          value={formData.country}
          onChange={handleChange}
          placeholder="Netherlands"
        />
      </div>

      <div className="form-actions">
        <button type="button" onClick={() => navigate('/')} className="btn btn-secondary">
          Cancel
        </button>
        <button type="submit" disabled={loading} className="btn btn-primary">
          {loading ? 'Saving...' : (isEditing ? 'Update' : 'Add Address')}
        </button>
      </div>
    </form>
  );
}

export default AddressForm;
