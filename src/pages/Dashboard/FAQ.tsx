import {
	Box,
	Typography,
	Accordion,
	AccordionSummary,
	AccordionDetails,
	useTheme
} from "@mui/material";
import Header from "../../components/dashboard/Header";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {tokens} from "../../theme";


const FAQ = () => {
	const theme = useTheme()
	const colors = tokens(theme.palette.mode)

	return (
		<Box m="20px">
			<Header title="FAQ" subtitle="Frequently Asked Questions Page"/>

			<Accordion defaultExpanded>
				<AccordionSummary expandIcon={<ExpandMoreIcon />}>
					<Typography variant="h5" color={colors.greenAccent[500]}>An Important question</Typography>
				</AccordionSummary>
				<AccordionDetails>
					<Typography>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Natus, tempora.</Typography>
				</AccordionDetails>
			</Accordion>

			<Accordion defaultExpanded>
				<AccordionSummary expandIcon={<ExpandMoreIcon />}>
					<Typography variant="h5" color={colors.greenAccent[500]}>An Important question</Typography>
				</AccordionSummary>
				<AccordionDetails>
					<Typography>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Natus, tempora.</Typography>
				</AccordionDetails>
			</Accordion>

			<Accordion defaultExpanded>
				<AccordionSummary expandIcon={<ExpandMoreIcon />}>
					<Typography variant="h5" color={colors.greenAccent[500]}>An Important question</Typography>
				</AccordionSummary>
				<AccordionDetails>
					<Typography>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Natus, tempora.</Typography>
				</AccordionDetails>
			</Accordion>
		</Box>
	)
}

export default FAQ
