import React from "react";
import { useQuery, useMutation } from "@apollo/client";
import gql from "graphql-tag";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { Typography, TextField, Button } from "@mui/material";
import styles from "./index.module.css";

const GET_BOOKMARKS = gql`
  {
    bookmarks {
      url
      name
    }
  }
`;

const ADD_BOOKMARK = gql`
  mutation addBookmark($url: String!, $name: String!) {
    addBookmark(url: $url, name: $name) {
      url
      name
    }
  }
`;

const Home = () => {
  const { data, loading, error } = useQuery(GET_BOOKMARKS);
  const [addBookmark] = useMutation(ADD_BOOKMARK);

  console.log(loading);
  console.log(error);

  return (
    <div className={styles.container}>
      <Typography
        className={styles.title}
        variant="h4"
        component="div"
        gutterBottom
      >
        Bookmarking App
      </Typography>
      <Formik
        initialValues={{ url: "", name: "" }}
        validationSchema={Yup.object({
          url: Yup.string().required("Url is required"),
          name: Yup.string().required("Name is required"),
        })}
        onSubmit={({ url, name }, { resetForm }) => {
          addBookmark({
            variables: { url, name },
            refetchQueries: [{ query: GET_BOOKMARKS }],
          });
          resetForm();
        }}
      >
        {({ errors, touched, handleSubmit }) => (
          <Form className={styles.form} onSubmit={handleSubmit}>
            <Field
              className={styles.textfield}
              label="Url"
              placeholder="Url"
              as={TextField}
              variant="outlined"
              type="text"
              name="url"
              error={errors.url && touched.url}
              helperText={<ErrorMessage name="url" />}
            />
            <br />
            <Field
              className={styles.textfield}
              label="Name"
              placeholder="Name"
              as={TextField}
              variant="outlined"
              type="text"
              name="name"
              error={errors.name && touched.name}
              helperText={<ErrorMessage name="name" />}
            />
            <Button className={styles.btn} type="submit">
              Add Bookmark
            </Button>
          </Form>
        )}
      </Formik>
      <ul className={styles.bookmarks}>
        {data &&
          data.bookmarks.map((bookmark, index) => (
            <li key={index}>
              <a href={bookmark.url}>{bookmark.name}</a>
            </li>
          ))}
      </ul>
    </div>
  );
};

export default Home;
