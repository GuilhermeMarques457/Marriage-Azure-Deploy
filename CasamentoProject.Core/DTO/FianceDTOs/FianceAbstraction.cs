﻿using CasamentoProject.Core.Domain.Entities;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Threading.Tasks;

namespace CasamentoProject.Core.DTO.FianceDTOs
{
    public abstract class FianceAbstraction
    {
        public string Name { get; set; } = null!;
        public int? Age { get; set; } = null!;
        public string? PhotoPath { get; set; }
        public Guid MarriageId { get; set; }
        public Marriage? Marriage { get; set; }

        public virtual Fiance ToFiance()
        {
            return new Fiance()
            {
                Name = Name, 
                Age = Age,
                PhotoPath = PhotoPath,
                Marriage = Marriage,
                MarriageId = MarriageId
            };
        }
    }
}
