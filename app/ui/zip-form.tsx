

interface ZipProps {
    handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void,
    handleOnChange: (e: React.ChangeEvent<HTMLInputElement>) => void,
    zip: string
}

export default function ZipForm({handleSubmit, handleOnChange, zip}: ZipProps) {
    return (
        <form onSubmit={handleSubmit}>
            <label>
            Zip:
            <input type="text" value={zip} onChange={handleOnChange} />
            </label>
            <input type="submit" value="Submit" />
        </form>
    );
}