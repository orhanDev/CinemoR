"use client";

import React, { useState, useRef, useEffect } from "react";
import "./CustomSelect.scss";


export function CustomSelect({
	id,
	label,
	ariaLabel,
	options,
	value,
	onChange,
	wrapperClassName,
	triggerClassName,
}) {
	const [open, setOpen] = useState(false);
	const ref = useRef(null);

	useEffect(() => {
		if (!open) return;
		const handle = (e) => {
			if (ref.current && !ref.current.contains(e.target)) setOpen(false);
		};
		document.addEventListener("mousedown", handle);
		document.addEventListener("touchstart", handle, { passive: true });
		return () => {
			document.removeEventListener("mousedown", handle);
			document.removeEventListener("touchstart", handle);
		};
	}, [open]);

	const selectedOption = options.find((o) => o.value === value);
	const displayText = selectedOption ? selectedOption.label : (options[0]?.label ?? "");

	return (
		<div className={`custom-select__wrap ${wrapperClassName || ""}`.trim()} ref={ref}>
			{label && (
				<label htmlFor={id} className="custom-select__label">
					{label}
				</label>
			)}
			<button
				type="button"
				id={id}
				className={`custom-select__trigger ${triggerClassName || ""}`}
				onClick={() => setOpen((o) => !o)}
				aria-haspopup="listbox"
				aria-expanded={open}
				aria-label={ariaLabel || label}
			>
				<span className="custom-select__trigger-text">{displayText}</span>
				<span className="custom-select__trigger-icon" aria-hidden>▼</span>
			</button>
			{open && (
				<ul
					className="custom-select__list"
					role="listbox"
					aria-activedescendant={value ? `opt-${value.replace(/\s/g, "-")}` : undefined}
				>
					{options.map((opt) => (
						<li
							key={opt.value === "" ? "__all__" : opt.value}
							id={opt.value ? `opt-${opt.value.replace(/\s/g, "-")}` : undefined}
							role="option"
							aria-selected={opt.value === value}
							className={`custom-select__option ${opt.value === value ? "is-selected" : ""}`}
							onClick={() => {
								onChange(opt.value);
								setOpen(false);
							}}
						>
							{opt.label}
						</li>
					))}
				</ul>
			)}
		</div>
	);
}
