interface Props {
    title:string
}


const Banner = ({title}:Props) => {
    return (
        <>
        <h2>{title}</h2>
        <hr/>
        </>
    )
}

export default Banner;