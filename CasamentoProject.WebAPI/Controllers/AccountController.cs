﻿using CasamentoProject.Core.DTO.AccountDTOs;
using CasamentoProject.Core.Identity;
using CasamentoProject.Core.ServiceContracts.AccountContracts;
using CasamentoProject.Core.Utils;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace CasamentoProject.WebAPI.Controllers
{
    [AllowAnonymous]
    [Route("api/[controller]")]
    public class AccountController : Controller
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly SignInManager<ApplicationUser> _signInManager;
        private readonly RoleManager<ApplicationRole> _roleManager;
        private readonly IJwtService _jwtService;

        public AccountController(SignInManager<ApplicationUser> signInManager,
           RoleManager<ApplicationRole> roleManager,
           UserManager<ApplicationUser> userManager,
           IJwtService jwtService
        )
        {
            _signInManager = signInManager;
            _userManager = userManager;
            _roleManager = roleManager;
            _jwtService = jwtService;
        }

        [HttpPost("Register")]
        public async Task<ActionResult<ResponseUser>> PostRegister([FromBody]RegisterDTO registerDTO)
        {
            if (!ModelState.IsValid)
            {
                string errorMessageRegister = string.Join(" , ",
                    ModelState.Values.SelectMany(v => v.Errors)
                        .Select(e => e.ErrorMessage));

                return Problem(errorMessageRegister);
            }

            ApplicationUser? user = new ApplicationUser()
            {
                Email = registerDTO.Email,
                PhoneNumber = registerDTO.PhoneNumber,
                UserName = registerDTO.Email,
                PersonName = registerDTO.Email,
            };

            IdentityResult result = await _userManager.CreateAsync(user, registerDTO.Password!);

            if (result.Succeeded)
            {
                var authenticationResponse = _jwtService.CreateJwtToken(user);
                user.RefreshToken = authenticationResponse.RefreshToken;

                user.RefreshTokenExpirationDateTime = authenticationResponse.RefreshTokenExpirationDateTime;

                await _userManager.UpdateAsync(user);

                return Ok(authenticationResponse);
            }

            string errorMessage = string.Join(" , ", result.Errors.Select(e => e.Description));

            return Problem(errorMessage);
        }

        [HttpPost("Login")]
        public async Task<ActionResult<ResponseUser>> PostLogin([FromBody]LoginDTO login)
        {
            if (!ModelState.IsValid)
            {
                string errorMessageLogin = string.Join(" , ",
                    ModelState.Values.SelectMany(v => v.Errors)
                        .Select(e => e.ErrorMessage));

                return Problem(errorMessageLogin);
            }

            var result = await _signInManager.PasswordSignInAsync(login.Email!, login.Password!, isPersistent: false, lockoutOnFailure: false);

            if (!result.Succeeded) throw new NotFoundException(nameof(result), "Email ou senha incorretos");

            ApplicationUser? user = await _userManager.FindByEmailAsync(login.Email!);

            if (user == null)
            {
                return NoContent();
            }

            await _signInManager.SignInAsync(user, isPersistent: false);

            var authenticationResponse = _jwtService.CreateJwtToken(user);

            user.RefreshToken = authenticationResponse.RefreshToken;

            user.RefreshTokenExpirationDateTime = authenticationResponse.RefreshTokenExpirationDateTime;

            await _userManager.UpdateAsync(user);

            return Ok(authenticationResponse);
           
        }

        [HttpGet("Logout")]
        public async Task<ActionResult> GetLogout()
        {
            await _signInManager.SignOutAsync();
            return NoContent();
        }

        [HttpGet]
        public async Task<ActionResult> IsEmailAlreadyRegistered(string email)
        {
            ApplicationUser? user = await _userManager.FindByNameAsync(email);

            if (user == null)
            {
                return Ok(true);
            }

            return Ok(false);
        }

        [HttpPost("generate-new-jwt-token")]
        public async Task<IActionResult> GenerateNewAccessToken(TokenModel tokenModel)
        {
            if (tokenModel == null)
            {
                return BadRequest("Invalid client request");
            }

            ClaimsPrincipal? principal = _jwtService.GetPrincipalFromJwtToken(tokenModel.Token);
            if (principal == null)
            {
                return BadRequest("Invalid jwt access token");
            }

            string? email = principal.FindFirstValue(ClaimTypes.Email);

            ApplicationUser? user = await _userManager.FindByEmailAsync(email!);

            if (user == null || user.RefreshToken != tokenModel.RefreshToken || user.RefreshTokenExpirationDateTime <= DateTime.Now)
            {
                return BadRequest("Invalid refresh token");
            }

            ResponseUser authenticationResponse = _jwtService.CreateJwtToken(user);

            user.RefreshToken = authenticationResponse.RefreshToken;
            user.RefreshTokenExpirationDateTime = authenticationResponse.RefreshTokenExpirationDateTime;

            await _userManager.UpdateAsync(user);

            return Ok(authenticationResponse);
        }
    }

}
