import {Box, Button, Grid, Paper, TextField, Typography} from "@mui/material";
import { useForm, Controller, SubmitHandler } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from 'yup'
import useMediaQuery from "@mui/material/useMediaQuery";
import Header from "./Header";
import {Fragment} from "react";

interface IFormInput {
	firstName: string
	lastName: string
	email: string
	contact: string
	address1: string
	address2: string
}

const phoneRegExp = /^((\+[1-9]{1,4}[ -]?)|(\([0-9]{2,3}\)[ -]?)|([0-9]{2,4})[ -]?)*?[0-9]{3,4}[ -]?[0-9]{3,4}$/

const schema = yup.object().shape({
	firstName: yup.string().required("First Name is required"),
	lastName: yup.string().required("Last Name required"),
	email: yup.string().email("Invalid Email").required("Email is required"),
	contact: yup.string().matches(phoneRegExp, "Phone number is not valid").required("Phone number is required"),
	address1: yup.string().required("Address in required"),
	address2: yup.string().required("Address is required")
})

const handleFormSubmit : SubmitHandler<IFormInput> = (data) => {
	console.log(data)
}

const Form = () => {
	const inNonMobile = useMediaQuery('(min-width:600px)')

	const {register, handleSubmit, control, formState: { errors },} = useForm<IFormInput>({
		defaultValues: {
			firstName: "",
			lastName: "",
			email: "",
			contact: "",
			address1: "",
			address2: "",
		},
		resolver: yupResolver(schema),
	})

	return (
		<Box m="20px">
			<Header title="CREATE USER" subtitle="Create a New User Profile"/>
			<form onSubmit={handleSubmit(handleFormSubmit)}>
				<Box display="grid" gap="30px" gridTemplateColumns="repeat(4, minmax(0, 1fr))"
					 sx={{
						 "& > div": { gridColumn: inNonMobile ? undefined : "span 4" }
					 }}
				>
					{/*<Controller control={control} name="firstName"*/}
					{/*			render={({ field }) =>*/}
					{/*				<TextField fullWidth variant="filled" type="text" label="First Name" sx={{ gridColumn: "span 2" }} {...field} />}*/}
					{/*/>*/}
					{/*<Controller control={control} name="lastName"*/}
					{/*			render={({ field }) =>*/}
					{/*				<TextField fullWidth variant="filled" type="text" label="Last Name" sx={{ gridColumn: "span 2" }} {...field} />}*/}
					{/*/>*/}
					{/*<Controller control={control} name="email"*/}
					{/*			render={({ field }) =>*/}
					{/*				<TextField fullWidth variant="filled" type="text" label="Email" sx={{ gridColumn: "span 4" }} {...field} />}*/}
					{/*/>*/}
					{/*<Controller control={control} name="contact"*/}
					{/*			render={({ field }) =>*/}
					{/*				<TextField fullWidth variant="filled" type="text" label="Contact Number" sx={{ gridColumn: "span 4" }} {...field} error={!!errors.contact} helperText={errors.contact?.message} />}*/}
					{/*/>*/}
					{/*<Controller control={control} name="address1"*/}
					{/*			render={({ field }) =>*/}
					{/*				<TextField fullWidth variant="filled" type="text" label="Address 1" sx={{ gridColumn: "span 4" }} {...field} />}*/}
					{/*/>*/}
					{/*<Controller control={control} name="address2"*/}
					{/*			render={({ field }) =>*/}
					{/*				<TextField fullWidth variant="filled" type="text" label="Address 2" sx={{ gridColumn: "span 4" }} {...field} />}*/}
					{/*/>*/}

					<TextField fullWidth variant="filled" type="text" label="First Name" sx={{ gridColumn: "span 2" }} {...register('firstName')} error={!!errors.firstName} helperText={errors.firstName?.message}/>
					<TextField fullWidth variant="filled" type="text" label="Last Name" sx={{ gridColumn: "span 2" }} {...register('lastName')} error={!!errors.lastName} helperText={errors.lastName?.message}/>
					<TextField fullWidth variant="filled" type="text" label="Email" sx={{ gridColumn: "span 4" }} {...register('email')} error={!!errors.email} helperText={errors.email?.message} />
					<TextField fullWidth variant="filled" type="text" label="Contact Number" sx={{ gridColumn: "span 4" }} {...register('contact')} error={!!errors.contact} helperText={errors.contact?.message} />
					<TextField fullWidth variant="filled" type="text" label="Address 1" sx={{ gridColumn: "span 4" }} {...register('address1')} error={!!errors.address1} helperText={errors.address1?.message} />
					<TextField fullWidth variant="filled" type="text" label="Address 2" sx={{ gridColumn: "span 4" }} {...register('address2')} error={!!errors.address2} helperText={errors.address2?.message} />
					{/*<Typography variant="inherit" color="textSecondary">*/}
					{/*	{errors.firstName?.message}*/}
					{/*</Typography>*/}
				</Box>
				<Box display="flex" justifyContent="end" mt="20px">
					<Button type="submit" color="secondary" variant="contained" onClick={handleSubmit(handleFormSubmit)}>Create New User</Button>
				</Box>
			</form>
		</Box>
	)
}

export default Form
