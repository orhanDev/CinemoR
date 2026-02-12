"use client";
import { formatPhoneNumber } from "@/lib/helpers";
import React, { useState } from "react";
import { FormControl, FormGroup, FormLabel } from "react-bootstrap";

export const PhoneInput = ({ label, error, className = "mb-3", ...rest }) => {
	const [phoneNumber, setPhoneNumber] = useState(rest.defaultValue || "");

	const handlePhoneChange = (e) => {
		const formattedPhone = formatPhoneNumber(e.target.value);
		setPhoneNumber(formattedPhone);


		if (rest.onChange) {


			rest.onChange(formattedPhone);
		}
	};

	const { defaultValue, ...otherProps } = rest;

	return (
		<FormGroup className={className} controlId={otherProps.name}>
			<FormLabel>{label}</FormLabel>
			<FormControl
				{...otherProps}
				value={phoneNumber}
				onChange={handlePhoneChange}
				isInvalid={!!error}
				size="lg"
			/>
			<FormControl.Feedback type="invalid">{error}</FormControl.Feedback>
		</FormGroup>
	);
};