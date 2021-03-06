import React, { Component } from 'react';

import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import * as actions from '../../store/actions';


import Input from '../../components/UI/Input/Input';
import Button from '../../components/UI/Button/Button';

import Loader from '../../utilities/Loader/Loader';

import firebase, { registerChatListener } from '../../config/firebase';
import ToastContainer from '../../utilities/Toast/ToastContainer';


class Signin extends Component {
  state = {
    signupForm: {
      fields: [
        {
          name: 'email',
          label: 'Email',
          type: 'text',
          validation: {
            required: true,
            pattern: /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
          },
          value: '',
          valid: false,
        },
        {
          name: 'password',
          label: 'Password',
          type: 'password',
          validation: {
            required: true,
            minLength: 8,
          },
          minLength: 8,
          value: '',
          valid: false,
        },
      ],
      isValid: false,
    },
    loading: false,
  };

  toastContainerRef = React.createRef();

  getFormFieldByName = (fields, name) => {
    for (let i = 0; i < fields.length; i += 1) {
      if (fields[i].name === name) {
        return i;
      }
    }

    return -1;
  }

  inputChangedHandler = (inputIdentifier, isValid, value) => {
    const { signupForm } = this.state;

    const fieldIndex = this.getFormFieldByName(signupForm.fields, inputIdentifier);

    signupForm.fields[fieldIndex].valid = isValid;
    signupForm.fields[fieldIndex].value = value;

    signupForm.isValid = this.checkFormValid(signupForm);

    this.setState({
      signupForm,
    });
  };

  submitHandler = () => {
    this.setState({
      loading: true,
    });

    const { signupForm } = this.state;

    firebase
      .auth()
      .signInWithEmailAndPassword(
        signupForm.fields[0].value,
        signupForm.fields[1].value,
      )
      .then(({ user }) => {
        this.setState({
          loading: false,
        });

        registerChatListener(user.uid);
      })
      .catch((error) => {
        this.setState({
          loading: false,
        });

        this.handleAuthError(error);
      });
  };

  handleAuthError = (error) => {
    let message = 'An error has occurred. Please try again!';

    if (error.code === 'auth/wrong-password') {
      message = 'You have provided an invalid password! Please try again.';
    } else if (error.code === 'auth/user-not-found') {
      message = 'You have provided an invalid email address! Please try again.';
    }

    this.toastContainerRef.current.addErrorToast('Error', message);
  }

  checkFormValid = (form) => {
    let isFormValid = true;

    const { fields } = form;

    fields.forEach((field) => {
      if (!field.valid && isFormValid) {
        isFormValid = false;
      }
    });

    return isFormValid;
  }

  render() {
    const { signupForm, loading } = this.state;

    return (
      <div className="auth__card">
        <div className="auth__card__header">Sign In</div>

        <div>
          {signupForm.fields.map(field => (
            <Input
              changed={this.inputChangedHandler}
              name={field.name}
              label={field.label}
              type={field.type}
              required={field.required}
              validation={field.validation}
            />
          ))}
        </div>

        <Button
          block
          clicked={this.submitHandler}
          disabled={!signupForm.isValid}
          text="Submit"
        />

        <span>
          Already have an account?
          {' '}
          <Link to="/auth/signup">Sign Up.</Link>
        </span>
        <Loader transition overlay show={loading} />

        <ToastContainer ref={this.toastContainerRef} />
      </div>
    );
  }
}

const mapDispatchToProps = dispatch => ({
  setUser: user => dispatch({ type: actions.SET_USER, user }),
});

export default connect(null, mapDispatchToProps)(Signin);
