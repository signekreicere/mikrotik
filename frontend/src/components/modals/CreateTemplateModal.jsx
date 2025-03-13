import { useState } from 'react';

function CreateTemplateModal({ setShowPopup, refreshTemplates }) {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [customFields, setCustomFields] = useState([]);

    const handleAddField = () => {
        setCustomFields([...customFields, { name: '', type: 'text', options: [] }]);
    };

    const handleFieldChange = (index, key, value) => {
        const updatedFields = [...customFields];
        updatedFields[index][key] = value;
        setCustomFields(updatedFields);
    };

    const handleRemoveField = (index) => {
        setCustomFields(customFields.filter((_, i) => i !== index));
    };

    const handleSave = async () => {
        if (!name.trim() || !description.trim()) {
            alert('Please fill in all required fields.');
            return;
        }

        for (const field of customFields) {
            if (!field.name.trim()) {
                alert('Please fill in all custom field names.');
                return;
            }

            if (field.type === 'dropdown' && field.options.length === 0) {
                alert(`Dropdown field "${field.name}" must have at least one option.`);
                return;
            }
        }

        try {
            const response = await fetch('http://localhost:8000/create-template', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    name,
                    description,
                    custom_fields: customFields
                })
            });

            if (response.ok) {
                refreshTemplates();
                setShowPopup(false);
            } else {
                const data = await response.json();
                alert(data.message);
            }
        } catch (error) {
            alert('Failed to create template. Please try again.');
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2>Create New Template</h2>

                <input
                    className="field-row"
                    type="text"
                    placeholder="Template Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />

                <textarea
                    className="field-row"
                    placeholder="Description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                />

                <div className="custom-fields">
                    {customFields.map((field, index) => (
                        <div key={index} className="field-row">
                            <input
                                type="text"
                                placeholder="Field Name"
                                value={field.name}
                                onChange={(e) => handleFieldChange(index, 'name', e.target.value)}
                            />
                            <select
                                value={field.type}
                                onChange={(e) => handleFieldChange(index, 'type', e.target.value)}
                            >
                                <option value="text">Text</option>
                                <option value="dropdown">Dropdown</option>
                            </select>
                            {field.type === 'dropdown' && (
                                <input
                                    type="text"
                                    placeholder="Comma separated options"
                                    value={field.options.join(',')}
                                    onChange={(e) =>
                                        handleFieldChange(index, 'options', e.target.value.split(','))
                                    }
                                />
                            )}
                            <button onClick={() => handleRemoveField(index)} className="delete-btn">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="16"
                                    height="16"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <line x1="18" y1="6" x2="6" y2="18" />
                                    <line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                            </button>
                        </div>
                    ))}
                </div>

                <button onClick={handleAddField} className="add-field-btn">
                    + Add Field
                </button>

                <div className="modal-actions">
                    <button onClick={handleSave} className="btn-save">Save</button>
                    <button onClick={() => setShowPopup(false)} className="btn-cancel">Cancel</button>
                </div>
            </div>
        </div>
    );
}

export default CreateTemplateModal;