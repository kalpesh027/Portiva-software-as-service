import React from 'react';

const Contact = ({ contact }) => {
  return (
    <section>
      <h2>Contact</h2>
      <p>Email: {contact.email}</p>
      <p>LinkedIn: {contact.linkedin}</p>
    </section>
  );
};

export default Contact;
