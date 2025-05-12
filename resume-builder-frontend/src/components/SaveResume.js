// SaveResume.js (Ensure you're exporting the function properly)
import axios from 'axios';

const SaveResume = async () => {
  const resumeData = {
    name: "John Doe",
    email: "john@example.com",
    title: "Software Engineer",
    experience: [
      { company: "Company A", role: "Developer", years: 2 },
      { company: "Company B", role: "Senior Developer", years: 3 }
    ],
    education: [
      { degree: "B.Tech", university: "University A", year: 2020 }
    ],
    skills: ["JavaScript", "Node.js", "React"],
    template: "template1"
  };

  console.log("Sending resume data to backend:", resumeData);

  try {
    const response = await axios.post('http://localhost:5000/api/resume/save', resumeData);
    console.log(response.data); // Check the response
  } catch (error) {
    console.error("Error saving resume:", error.response ? error.response.data : error.message);
  }
};

export default SaveResume; // Make sure to export it as default
